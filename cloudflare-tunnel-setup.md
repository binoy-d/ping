# Sample Cloudflare Tunnel Configuration
# Add this to your existing cloudflared config file

# If you're using a config.yml file for cloudflared, add this service:
# 
# ingress:
#   - hostname: ping.binoy.co
#     service: http://localhost:3001
#   - service: http_status:404
#
# If you're using docker-compose for cloudflared, you might have something like:
#
# version: '3.8'
# services:
#   cloudflared:
#     image: cloudflare/cloudflared:latest
#     container_name: cloudflared
#     restart: unless-stopped
#     command: tunnel --config /etc/cloudflared/config.yml run
#     volumes:
#       - ./cloudflared:/etc/cloudflared
#     networks:
#       - cloudflare-tunnel
#
# And in your config.yml:
# tunnel: YOUR_TUNNEL_ID
# credentials-file: /etc/cloudflared/credentials.json
# 
# ingress:
#   - hostname: ping.binoy.co
#     service: http://ping-app:5000  # Note: using service name from docker-compose
#   - hostname: "*.binoy.co"
#     service: http://localhost:80
#   - service: http_status:404

# For command line usage:
# cloudflared tunnel route dns YOUR_TUNNEL_NAME ping.binoy.co
