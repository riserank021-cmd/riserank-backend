output "instance_public_ip" {
  description = "EC2 Elastic IP — point your domain A record to this"
  value       = aws_eip.riserank.public_ip
}

output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.riserank.id
}

output "s3_bucket_name" {
  description = "S3 bucket for avatar uploads"
  value       = aws_s3_bucket.assets.bucket
}

output "s3_bucket_url" {
  description = "S3 base URL for avatar uploads"
  value       = "https://${aws_s3_bucket.assets.bucket}.s3.${var.aws_region}.amazonaws.com"
}

output "ssh_command" {
  description = "SSH command to connect to your server"
  value       = "ssh -i riserank.pem ubuntu@${aws_eip.riserank.public_ip}"
}

output "next_steps" {
  value = <<-EOT
    ✅ Infrastructure created!

    1. Point your domain A record:
       api.riserank.in → ${aws_eip.riserank.public_ip}

    2. SSH into server:
       ssh -i riserank.pem ubuntu@${aws_eip.riserank.public_ip}

    3. Run bootstrap script:
       bash <(curl -fsSL https://raw.githubusercontent.com/riserank021-cmd/riserank-backend/main/scripts/bootstrap-ec2.sh)

    4. Create .env file on server with your credentials

    5. Get SSL certificate:
       sudo certbot --nginx -d api.riserank.in

    6. Start the app:
       pm2 start ecosystem.config.js --env production && pm2 save

    S3 bucket URL: https://${aws_s3_bucket.assets.bucket}.s3.${var.aws_region}.amazonaws.com
  EOT
}
