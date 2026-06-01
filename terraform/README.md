# RiseRank — Terraform Infrastructure

Provisions on AWS (ap-south-1 / Mumbai):
- EC2 t3.small (Ubuntu 22.04) with Elastic IP
- Security group (ports 22, 80, 443)
- S3 bucket for avatar uploads (public read)
- IAM role granting EC2 access to S3 (no hardcoded credentials needed)

---

## Prerequisites

### 1. Install Terraform (Mac)
```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
terraform --version   # should show 1.5+
```

### 2. Install AWS CLI + configure credentials
```bash
brew install awscli
aws configure
# Enter:
#   AWS Access Key ID: (from your CSV)
#   AWS Secret Access Key: (from your CSV)
#   Default region: ap-south-1
#   Default output format: json
```

### 3. Generate SSH key pair
```bash
cd terraform/
ssh-keygen -t rsa -b 4096 -f riserank -N ""
# Creates: riserank (private key) + riserank.pub (public key)
# Keep riserank (private key) safe — you need it to SSH into the server
```

---

## Deploy

```bash
cd riserank-backend/terraform/

terraform init       # download providers
terraform plan       # preview what will be created
terraform apply      # create everything (type 'yes' when prompted)
```

Takes about 30 seconds. When done, you'll see:
- Your server's public IP
- SSH command
- S3 bucket URL
- Next steps

---

## After deploy — point your domain

In your domain registrar (GoDaddy / Namecheap / etc.):
- Add an **A record**: `api.riserank.in` → `<EC2_PUBLIC_IP>`

Wait 5–15 minutes for DNS propagation, then run Certbot for SSL.

---

## Destroy (when you want to tear everything down)

```bash
terraform destroy
```

---

## Files

| File | Purpose |
|---|---|
| `main.tf` | EC2 instance, security group, key pair, Elastic IP |
| `s3.tf` | S3 bucket, public read policy, IAM role for EC2 |
| `variables.tf` | Configuration variables |
| `outputs.tf` | Useful values printed after apply |
