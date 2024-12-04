import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Github, 
  Cloud, 
  Shield, 
  AlertCircle, 
  Server, 
  Database, 
  Globe, 
  Code,
  Lock,
  Clock,
  Settings,
  ChevronDown 
} from 'lucide-react';
import { Card } from "../components/ui/card";
import '../styles/frontend.css';

// Code Preview Component
const CodePreview = ({ code, language = "hcl" }) => (
  <div className="code-preview">
    <div className="code-block">
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  </div>
);

// Info Box Component
const InfoBox = ({ children, type = "info" }) => (
  <div className={`info-box ${type}`}>
    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
    <div>{children}</div>
  </div>
);

const Frontend = () => {
  const navigate = useNavigate();

  const documentationSections = [
    { id: "overview", title: "Overview", icon: Cloud },
    { id: "s3", title: "S3 Storage", icon: Database },
    { id: "cloudfront", title: "CloudFront CDN", icon: Globe },
    { id: "dns", title: "DNS & SSL", icon: Lock },
    { id: "security", title: "WAF & Security", icon: Shield },
    { id: "lifecycle", title: "Lifecycle", icon: Clock },
    { id: "deployment", title: "Deployment", icon: Settings }
  ];

  const infrastructureFeatures = [
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "WAF protection with AWS managed rules and custom rate limiting",
      details: [
        "IP-based rate limiting (2000 requests)",
        "Common attack protection",
        "Known bad inputs filtering"
      ]
    },
    {
      icon: Globe,
      title: "Global Content Delivery",
      description: "CloudFront CDN with advanced caching strategies",
      details: [
        "IPv6 enabled distribution",
        "Custom domain support",
        "React router support"
      ]
    },
    {
      icon: Database,
      title: "Intelligent Storage",
      description: "S3 with smart lifecycle management",
      details: [
        "Intelligent-Tiering",
        "Automated archival",
        "Cost optimization"
      ]
    },
    {
      icon: Lock,
      title: "SSL/TLS Security",
      description: "Automated certificate management through ACM",
      details: [
        "Auto-renewal",
        "DNS validation",
        "TLS 1.2 enforcement"
      ]
    }
  ];


  // Code snippets reflecting actual infrastructure
  const codeSnippets = {
    s3: `# S3 Bucket Configuration
resource "aws_s3_bucket" "storage_bucket" {
  bucket        = "caringaldevops"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "storage_bucket" {
  bucket = aws_s3_bucket.storage_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "s3_cors" {
  bucket = aws_s3_bucket.storage_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Create default folders (prefixes)
resource "aws_s3_object" "avatar_images" {
  bucket  = aws_s3_bucket.storage_bucket.id
  key     = "avatar_images/"
  content = ""
}

resource "aws_s3_object" "react_build" {
  bucket  = aws_s3_bucket.storage_bucket.id
  key     = "react-build/"
  content = ""
}`,

    cloudfront: `# CloudFront Configuration
resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name                              = "s3-oac"
  description                       = "OAC for S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  price_class         = "PriceClass_All"
  aliases             = [var.domain_name]
  web_acl_id          = aws_wafv2_web_acl.cloudfront_waf.arn

  origin {
    domain_name              = aws_s3_bucket.storage_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
    origin_id                = "S3-React-App"
    origin_path             = "/react-build"
  }

  default_cache_behavior {
    allowed_methods        = ["HEAD", "GET", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-React-App"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]
      cookies {
        forward = "all"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.rewrite_uri.arn
    }
  }
}`,

    waf: `# WAF Configuration
resource "aws_wafv2_web_acl" "cloudfront_waf" {
  name        = "cloudfront-waf-\${var.environment}"
  description = "WAF Web ACL for CloudFront"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
  }

  rule {
    name     = "RateLimitRule"
    priority = 3
    action {
      block {}
    }
    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }
  }
}`,

    lifecycle: `# Lifecycle Configuration
resource "aws_s3_bucket_lifecycle_configuration" "bucket_lifecycle" {
  bucket = aws_s3_bucket.storage_bucket.id

  rule {
    id     = "avatar_images_lifecycle"
    status = "Enabled"
    filter {
      prefix = "avatar_images/"
    }
    
    transition {
      days          = 0
      storage_class = "INTELLIGENT_TIERING"
    }
  }

  rule {
    id     = "cleanup_failed_uploads"
    status = "Enabled"
    filter {
      prefix = ""
    }
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

resource "aws_s3_bucket_intelligent_tiering_configuration" "intelligent_archive" {
  bucket = aws_s3_bucket.storage_bucket.id
  name   = "archive_configuration"

  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }

  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 365
  }
}`
  };

  return (
    <div className="docs-container">
      {/* Modern AWS-style Navigation */}
      <header className="docs-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side: Logo and Navigation */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Portfolio</span>
              </button>

              <div className="hidden md:flex items-center gap-6">
                {documentationSections.slice(0, 4).map((section) => (
                  <a 
                    key={section.id}
                    href={`#${section.id}`} 
                    className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                  >
                    <section.icon className="w-4 h-4" />
                    {section.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/CaringalML/AWS-Lambda-ECS-Fargate-service-Automation"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">View on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </header>



      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">

          {/* Main Content */}
          <main className="col-span-12 lg:col-span-9 space-y-8">
            {/* Overview Section */}
            <Card className="docs-card" id="overview">
              <div className="card-content">
                <h1 className="docs-title flex items-center gap-3">
                  <Cloud className="w-8 h-8 text-orange-500" />
                  AWS Infrastructure Documentation
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  A comprehensive AWS cloud infrastructure for the Student Record System, 
                  built with Terraform and following AWS best practices for security and scalability.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {infrastructureFeatures.map((feature, index) => (
                    <div key={index} className="feature-item group">
                      <div className="flex items-center gap-3 mb-3">
                        <feature.icon className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{feature.description}</p>
                      <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* S3 Storage Section */}
            <Card className="docs-card" id="s3">
              <div className="card-content">
                <h2 className="section-title">
                  <Database className="w-6 h-6 text-orange-500" />
                  S3 Storage Configuration
                </h2>
                <p className="mb-6">
                  Core storage infrastructure using Amazon S3 with enhanced security and CORS support.
                </p>
                <InfoBox type="info">
                  All public access is blocked by default. CloudFront is used for content delivery.
                </InfoBox>
                <div className="my-6">
                  <h3 className="text-lg font-semibold mb-4">Storage Structure</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      {
                        name: "react-build",
                        description: "Production React application files",
                        icon: Code
                      },
                      {
                        name: "avatar_images",
                        description: "User profile images with intelligent tiering",
                        icon: Database
                      },
                      {
                        name: "student_files",
                        description: "Academic documents and records",
                        icon: Server
                      }
                    ].map((folder, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <folder.icon className="w-5 h-5 text-orange-500 mb-2" />
                        <h4 className="font-medium mb-1">{folder.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{folder.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <CodePreview code={codeSnippets.s3} />
              </div>
            </Card>

            {/* CloudFront Section */}
            <Card className="docs-card" id="cloudfront">
              <div className="card-content">
                <h2 className="section-title">
                  <Globe className="w-6 h-6 text-orange-500" />
                  CloudFront Distribution
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="feature-item">
                    <h3 className="font-semibold mb-2">Primary Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-orange-500" />
                        HTTPS enforcement
                      </li>
                      <li className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-orange-500" />
                        IPv6 support
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-500" />
                        WAF integration
                      </li>
                    </ul>
                  </div>
                  <div className="feature-item">
                    <h3 className="font-semibold mb-2">Cache Behaviors</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-orange-500" />
                        React application (default)
                      </li>
                      <li className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-orange-500" />
                        Media files (/avatar_images/*)
                      </li>
                      <li className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-orange-500" />
                        Student files (/student_files/*)
                      </li>
                    </ul>
                  </div>
                </div>
                <CodePreview code={codeSnippets.cloudfront} />
              </div>
            </Card>

            {/* Security & WAF Section */}
            <Card className="docs-card" id="security">
              <div className="card-content">
                <h2 className="section-title">
                  <Shield className="w-6 h-6 text-orange-500" />
                  Security Configuration
                </h2>
                <InfoBox type="warning">
                  WAF is configured in us-east-1 region as required for CloudFront integration.
                </InfoBox>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">WAF Protection</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">Managed Rules</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• AWS Common Rule Set</li>
                        <li>• Known Bad Inputs Protection</li>
                        <li>• Core Rule Set (CRS)</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">Custom Rules</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Rate limiting: 2000 req/IP</li>
                        <li>• IP-based blocking</li>
                        <li>• Request validation</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <CodePreview code={codeSnippets.waf} />
              </div>
            </Card>

            {/* Lifecycle Section */}
            <Card className="docs-card" id="lifecycle">
              <div className="card-content">
                <h2 className="section-title">
                  <Clock className="w-6 h-6 text-orange-500" />
                  Lifecycle Management
                </h2>
                <div className="mb-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="feature-item">
                      <h3 className="font-semibold mb-2">Intelligent Tiering</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Immediate transition for new objects</li>
                        <li>• Automatic cost optimization</li>
                        <li>• Access pattern monitoring</li>
                      </ul>
                    </div>
                    <div className="feature-item">
                      <h3 className="font-semibold mb-2">Archive Rules</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Archive Access after 90 days</li>
                        <li>• Deep Archive after 365 days</li>
                        <li>• Cleanup after 7 days for incomplete uploads</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <CodePreview code={codeSnippets.lifecycle} />
              </div>
            </Card>

            {/* Deployment Guide */}
            <Card className="docs-card" id="deployment">
              <div className="card-content">
                <h2 className="section-title">
                  <Settings className="w-6 h-6 text-orange-500" />
                  Deployment Guide
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Prerequisites</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium mb-2">Required Tools</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• AWS CLI configured</li>
                          <li>• Terraform &gt;= 1.0.0</li>
                          <li>• Domain in Route53</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium mb-2">AWS Access</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• IAM credentials</li>
                          <li>• Required permissions</li>
                          <li>• Access to us-east-1 region</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Frontend;