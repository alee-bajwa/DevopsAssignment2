pipeline {
    agent any

    stages {
        stage('Fetch Code') {
            steps {
                checkout scm
            }
        }

        stage('Deploy App') {
            steps {
                script {
                    // Bring up the deployment first so tests can access it
                    sh 'docker-compose -f docker-compose-pipeline.yml -p pipeline down || true'
                    sh 'docker-compose -f docker-compose-pipeline.yml -p pipeline up -d'
                    
                    // Poll http://localhost:3000 until it is available (timeout after 5 minutes)
                    sh '''
                    timeout=300
                    elapsed=0
                    while ! curl -s http://localhost:3000 > /dev/null; do
                        if [ $elapsed -ge $timeout ]; then
                            echo "Timeout waiting for Haki Bank app to start."
                            exit 1
                        fi
                        echo "Haki Bank app not ready yet, sleeping 10s... ($elapsed/$timeout)"
                        sleep 10
                        elapsed=$((elapsed + 10))
                    done
                    echo "Haki Bank app is ready and listening on port 3000!"
                    '''
                }
            }
        }

        stage('Run Tests in Docker') {
            agent {
                docker {
                    image 'joyzoursky/python-chromedriver:3.9'
                    // Run container on host network so it can access localhost:3000 where the app is deployed
                    args '--user root --network host'
                }
            }
            steps {
                script {
                    echo 'Fetching test cases...'
                    sh 'rm -rf test-cases-repo || true'
                    sh 'git clone https://github.com/alee-bajwa/tese-cases.git test-cases-repo'
                    
                    echo 'Installing requirements and running tests...'
                    sh '''
                    pip install -r test-cases-repo/requirements.txt
                    pytest test-cases-repo/test_app.py --junitxml=test-results.xml || true
                    '''
                }
            }
            post {
                always {
                    junit 'test-results.xml'
                }
            }
        }
    }

    post {
        always {
            script {
                // Get the email of the person who pushed the commit
                def COMMITTER_EMAIL = sh(
                    script: "git show -s --format='%ae' HEAD", 
                    returnStdout: true
                ).trim()

                echo "Sending email to: ${COMMITTER_EMAIL}"

                // Send email to the committer using Jenkins Email Extension Plugin
                emailext (
                    subject: "Test Results & Deployment Status - Build #${env.BUILD_NUMBER}",
                    body: """The pipeline execution has finished.

Build Status: ${currentBuild.currentResult}


Check full console output at: ${env.BUILD_URL}""",
                    to: "${COMMITTER_EMAIL}",
                    attachLog: true
                )
            }
        }
    }
}