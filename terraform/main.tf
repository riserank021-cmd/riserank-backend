terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ── Data: Latest Ubuntu 22.04 LTS AMI ─────────────────────────────────────────
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ── Key Pair ──────────────────────────────────────────────────────────────────
resource "aws_key_pair" "riserank" {
  key_name   = "${var.app_name}-key"
  public_key = file("${path.module}/riserank.pub")  # see README for how to generate

  tags = {
    Name        = "${var.app_name}-key"
    Environment = var.environment
  }
}

# ── VPC Security Group ────────────────────────────────────────────────────────
resource "aws_security_group" "riserank" {
  name        = "${var.app_name}-sg"
  description = "RiseRank backend security group"

  # SSH — restrict to your IP in production
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_ip]
  }

  # HTTP
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.app_name}-sg"
    Environment = var.environment
  }
}

# ── EC2 Instance ──────────────────────────────────────────────────────────────
resource "aws_instance" "riserank" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.riserank.key_name
  vpc_security_group_ids = [aws_security_group.riserank.id]

  root_block_device {
    volume_size = 20    # GB
    volume_type = "gp3" # faster + cheaper than gp2
  }

  # Attach IAM role for S3 access (avoids hardcoding credentials on server)
  iam_instance_profile = aws_iam_instance_profile.riserank_ec2.name

  user_data = <<-EOF
    #!/bin/bash
    # Tag the instance so we can identify it
    echo "riserank-backend" > /etc/hostname
    hostnamectl set-hostname riserank-backend
  EOF

  tags = {
    Name        = "${var.app_name}-backend"
    Environment = var.environment
  }
}

# ── Elastic IP (static IP that survives reboots) ──────────────────────────────
resource "aws_eip" "riserank" {
  instance = aws_instance.riserank.id
  domain   = "vpc"

  tags = {
    Name        = "${var.app_name}-eip"
    Environment = var.environment
  }
}
