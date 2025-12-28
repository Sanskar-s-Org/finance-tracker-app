pipeline {
    agent any

    options {
        timestamps()
    }

    tools {
        nodejs 'nodejs-22-6-0'
    }

    stages {
        stage('Build and Install Dependencies') {
            parallel {

                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh '''
                                echo "📦 Installing backend dependencies..."
                                npm ci --no-audit --no-fund
                            '''
                        }
                    }
                }

                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh '''
                                echo "📦 Installing frontend dependencies..."
                                npm ci --no-audit --no-fund
                            '''
                        }
                    }
                }
            }
        }
        stage('Security Checks') {
            parallel {
                
                stage('NPM Audit - Backend') {
                    steps {
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            dir('backend') {
                                sh '''
                                    echo "🔍 Running npm audit on backend..."
                                    npm audit --audit-level=critical --json > backend-audit.json || true
                                    npm audit --audit-level=critical
                                '''
                            }
                        }
                    }
                }
                
                stage('NPM Audit - Frontend') {
                    steps {
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            dir('frontend') {
                                sh '''
                                    echo "🔍 Running npm audit on frontend..."
                                    npm audit --audit-level=critical --json > frontend-audit.json || true
                                    npm audit --audit-level=critical
                                '''
                            }
                        }
                    }
                }
                
                stage('OWASP Dependency Check') {
                    steps {
                        script {
                            withCredentials([string(credentialsId: 'nvd-api-key', variable: 'NVD_API_KEY')]) {

                                /* ---------------------------
                                Dependency-Check properties
                                --------------------------- */
                                sh '''
                                    echo "nvdApiKey=${NVD_API_KEY}" > dependency-check.properties
                                    echo "nvdApiDelay=8000" >> dependency-check.properties
                                    echo "nvdValidForHours=24" >> dependency-check.properties
                                '''

                                /* ---------------------------
                                Full workspace scan
                                (package-lock.json is in root)
                                --------------------------- */
                                dependencyCheck(
                                    odcInstallation: 'OWASP-DepCheck-12',
                                    additionalArguments: '''
                                        --scan .
                                        --out .
                                        --format ALL
                                        --prettyPrint
                                        --propertyfile dependency-check.properties
                                    '''
                                )

                                /* ---------------------------
                                Publish results to Jenkins
                                --------------------------- */
                                dependencyCheckPublisher(
                                    pattern: '**/dependency-check-report.xml',
                                    failedTotalCritical: 1,
                                    failedTotalHigh: 5,
                                    unstableTotalCritical: 0,
                                    unstableTotalHigh: 3,
                                    stopBuild: false
                                )

                                /* ---------------------------
                                Archive reports
                                --------------------------- */
                                archiveArtifacts(
                                    artifacts: '**/dependency-check-report.*',
                                    allowEmptyArchive: true
                                )
                            }
                        }
                    }
                }

            }
        }
    }

    post {
        success {
            echo "✅ Dependency installation completed successfully"
        }
        failure {
            echo "❌ Dependency installation failed"
        }
    }
}
