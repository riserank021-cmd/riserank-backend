variable "aws_region" {
  description = "AWS region"
  default     = "ap-south-1"  # Mumbai — closest to Indian users
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t3.small"  # 2 vCPU, 2GB RAM — good for launch
}

variable "app_name" {
  description = "Application name"
  default     = "riserank"
}

variable "environment" {
  description = "Environment"
  default     = "production"
}

variable "ssh_allowed_ip" {
  description = "Your IP/CIDR for SSH access (run: curl ifconfig.me, then append /32). Required — no default to prevent accidental open access."
  type        = string
  # No default: forces you to set this explicitly.
  # Example: terraform apply -var='ssh_allowed_ip=203.0.113.45/32'
  # Or set TF_VAR_ssh_allowed_ip=203.0.113.45/32 in your environment.
}

variable "domain" {
  description = "Your domain name (e.g. api.riserank.in)"
  default     = "api.riserank.in"
}

variable "s3_bucket_name" {
  description = "S3 bucket for user avatar uploads"
  default     = "riserank-assets"
}
