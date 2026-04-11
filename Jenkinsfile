pipeline {
    agent any
    stages {
        stage('Fetch Code') {
            steps {
                checkout scm
            }
        }
        stage('Deploy Part 2') {
            steps {
                script {
                    // -p pipeline ensures no conflict with Part 1
                    sh 'docker-compose -f docker-compose-pipeline.yml -p pipeline down || true'
                    sh 'docker-compose -f docker-compose-pipeline.yml -p pipeline up -d'
                }
            }
        }
    }
}