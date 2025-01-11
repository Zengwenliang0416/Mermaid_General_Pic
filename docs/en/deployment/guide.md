# Deployment Guide

## Environment Requirements

### System Requirements
- Node.js >= 16.0.0
- pnpm >= 8.0.0
- Redis >= 6.0.0
- SQLite >= 3.0.0
- Linux/Unix system recommended

### Hardware Requirements
- CPU: 2+ cores
- Memory: 4GB+ RAM
- Storage: 20GB+ disk space
- Network: 5Mbps+ bandwidth

### Network Requirements
- Open required ports (80/443)
- Configure domain and SSL certificate
- Set up firewall rules
- Configure load balancer (optional)

## Installation and Deployment

### Frontend Deployment
1. Get the code
```bash
git clone https://github.com/your-repo/Mermaid_General_Pic-Web.git
cd Mermaid_General_Pic-Web
```

2. Install dependencies
```bash
pnpm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env file to configure necessary environment variables
```

4. Build the project
```bash
pnpm build
```

5. Deploy static files
```bash
# Deploy files in dist directory to web server
```

### Backend Deployment
1. Get the code
```bash
git clone https://github.com/your-repo/Mermaid_General_Pic-Services.git
cd Mermaid_General_Pic-Services
```

2. Install dependencies
```bash
pnpm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env file to configure necessary environment variables
```

4. Initialize database
```bash
pnpm run migrate
```

5. Start service
```bash
pnpm start
```

### Docker Deployment
1. Build images
```bash
docker-compose build
```

2. Start services
```bash
docker-compose up -d
```

## Configuration

### Frontend Configuration
- `VITE_API_BASE_URL`: API base URL
- `VITE_AI_API_KEY`: AI service API key
- `VITE_APP_TITLE`: Application title
- `VITE_APP_DESCRIPTION`: Application description

### Backend Configuration
- `PORT`: Service port
- `NODE_ENV`: Runtime environment
- `DATABASE_URL`: Database connection
- `REDIS_URL`: Redis connection
- `AI_API_KEY`: AI service key
- `LOG_LEVEL`: Log level

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Performance Optimization

### Frontend Optimization
- Enable Gzip compression
- Configure browser caching
- Use CDN acceleration
- Optimize resource loading
- Enable pre-rendering
- Lazy load components

### Backend Optimization
- Enable response compression
- Configure caching strategy
- Optimize database queries
- Use connection pools
- Limit request size
- Configure timeouts

### Database Optimization
- Optimize index design
- Configure query cache
- Regular maintenance
- Monitor performance metrics
- Configure connection pool
- Regular data backup

## Monitoring and Alerting

### System Monitoring
- CPU usage
- Memory usage
- Disk usage
- Network traffic
- Process status
- System logs

### Application Monitoring
- API response time
- Error rate statistics
- Concurrent connections
- Business metrics
- User activity
- Resource usage

### Alert Configuration
- Set alert thresholds
- Configure alert channels
- Set alert levels
- Alert escalation strategy
- Alert suppression rules
- Recovery notifications

## Log Management

### Log Configuration
- Access logs
- Error logs
- Business logs
- Security logs
- Performance logs
- Audit logs

### Log Collection
- Use ELK stack
- Configure log rotation
- Set retention policy
- Compress historical logs
- Regular cleanup
- Backup important logs

### Log Analysis
- Error troubleshooting
- Performance analysis
- User behavior analysis
- Security audit
- Business statistics
- Trend analysis

## Backup and Recovery

### Data Backup
- Scheduled automatic backup
- Manual backup method
- Backup content description
- Backup storage strategy
- Backup monitoring alerts
- Backup testing verification

### Data Recovery
- Recovery process description
- Recovery test plan
- Recovery drill plan
- Emergency recovery plan
- Data consistency check
- Post-recovery verification

## Troubleshooting

### Common Issues
- Service inaccessible
- Slow API response
- Database connection failure
- Cache service error
- Log writing failure
- Insufficient disk space

### Resolution Process
1. Issue detection
2. Initial diagnosis
3. Root cause identification
4. Action implementation
5. Service restoration
6. Post-mortem analysis

### Emergency Plan
- Service degradation plan
- Rate limiting strategy
- Data backup recovery
- Emergency response process
- Escalation mechanism
- Notification process

## Maintenance and Updates

### Routine Maintenance
- System inspection
- Performance optimization
- Security hardening
- Data cleanup
- Configuration updates
- Documentation maintenance

### Version Updates
- Update plan creation
- Update content confirmation
- Update risk assessment
- Update execution
- Update verification
- Rollback plan preparation

## Language Switch

- [English Version](./guide.md)
- [中文版本](../../zh/deployment/guide.md) 