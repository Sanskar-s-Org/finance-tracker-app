pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 1, unit: 'HOURS')
    }

    tools {
        nodejs 'nodejs-22-6-0'
    }

    stages {
        
        stage('Install Dependencies') {
            steps {
                script {
                    echo '📦 Installing dependencies from root (workspace mode)...'
                    sh 'npm run install:all'
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
                                    npm audit --audit-level=critical || true
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
                                    npm audit --audit-level=critical || true
                                '''
                            }
                        }
                    }
                }
                
                stage('OWASP Dependency Check') {
                    steps {
                        script {
                            withCredentials([string(credentialsId: 'nvd-api-key', variable: 'NVD_API_KEY')]) {
                                sh '''
                                    echo "nvdApiKey=${NVD_API_KEY}" > dependency-check.properties
                                    echo "nvdApiDelay=8000" >> dependency-check.properties
                                    echo "nvdValidForHours=24" >> dependency-check.properties
                                '''
                                
                                dependencyCheck(
                                    odcInstallation: 'OWASP-DepCheck-12',
                                    additionalArguments: '''
                                        --scan ./backend
                                        --scan ./frontend
                                        --scan ./node_modules
                                        --out .
                                        --format ALL
                                        --prettyPrint
                                        --propertyfile dependency-check.properties
                                        --enableExperimental
                                    '''
                                )
                                
                                dependencyCheckPublisher(
                                    pattern: '**/dependency-check-report.xml',
                                    failedTotalCritical: 1,
                                    failedTotalHigh: 5,
                                    unstableTotalCritical: 0,
                                    unstableTotalHigh: 3,
                                    stopBuild: false
                                )
                                
                                archiveArtifacts(
                                    artifacts: 'dependency-check-report.*',
                                    allowEmptyArchive: true
                                )
                                
                                sh 'rm -f dependency-check.properties'
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed'
        }
        always {
            echo '📊 Security reports available in Jenkins artifacts'
        }
    }
}
