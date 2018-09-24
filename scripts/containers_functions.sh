#!/bin/bash

source ./scripts/common_functions.sh

set -e

export CLUSTER_NAME='sample-kubernetes-gab'
export KUBERNETES_SERVICE_PLUGIN_NAME='kubernetes-service'
export CONTAINER_REGISTRY_PLUGIN_NAME='container-registry'
export KUBERNETES_VERSION='1.9.9'
export KUBECTL_VERSION='1.9.0'

export CLOUDANT_SERVICE_INSTANCE='sample-cloudant-gab'
export CLOUDANT_SERVICE_NAME='cloudantNoSQLDB'
export CLOUDANT_SERVICE_PLAN='Lite'
export CLOUDANT_SERVICE_KEY='credentials1'

NAMESPACE='gdecapoa'

DEPLOYMENT_FILE='./kubernetes/deployment.yml'
SECRET_FILE='./kubernetes/secret.yml'
SERVICE_FILE='./kubernetes/service.yml'
CONFIGMAP_FILE='./kubernetes/configmap.yml'
SECRET_NAME='nodejs-cloudant-secret'
DEPLOYMENT_NAME='nodejs-cloudant'
SERVICE_NAME='nodejs-cloudant-service'
CONFIGMAP_NAME='nodejs-cloudant-configmap'

function insert_secret {
    value=$(printf "%s" $3 | openssl base64)
    echo "  $2: $value" >> $1
}

function substitute_variables_in_secret {
    sed -i.bak -e "s/%CLOUDANT_URL%/${CLOUDANT_URL}/g" $1
}

function substitute_variables_in_deployment {
    sed -i.bak -e "s/%NAMESPACE%/${NAMESPACE}/g" $1
    sed -i.bak -e "s/%VERSION%/${VERSION}/g" $1
}
function check_kubernetes_service_plugin {
    echo -e "${BLUE_COLOR}Verify if ${KUBERNETES_SERVICE_PLUGIN_NAME} plugin is installed${NO_COLOR}"
    plugin=$(bx plugin list | grep ${KUBERNETES_SERVICE_PLUGIN_NAME} | wc -l )
    if [[ ${plugin} -eq 1 ]]; then
        echo -e "${GREEN_COLOR}${KUBERNETES_SERVICE_PLUGIN_NAME} plugin already installed. Updating...${NO_COLOR}"
        bx plugin update ${KUBERNETES_SERVICE_PLUGIN_NAME} -r Bluemix
        echo -e "${GREEN_COLOR}${KUBERNETES_SERVICE_PLUGIN_NAME} plugin updated${NO_COLOR}"
    else
        echo -e "${YELLOW_COLOR}${KUBERNETES_SERVICE_PLUGIN_NAME} plugin not installed. Installing...${NO_COLOR}"
        bx plugin install ${KUBERNETES_SERVICE_PLUGIN_NAME} -r Bluemix
        echo -e "${GREEN_COLOR}${KUBERNETES_SERVICE_PLUGIN_NAME} plugin installed${NO_COLOR}"
    fi
}

function check_container_registry_plugin {
    echo -e "${BLUE_COLOR}Verify if ${CONTAINER_REGISTRY_PLUGIN_NAME} plugin is installed${NO_COLOR}"
    plugin=$(bx plugin list | grep ${CONTAINER_REGISTRY_PLUGIN_NAME} | wc -l )
    if [[ ${plugin} -eq 1 ]]; then
        echo -e "${GREEN_COLOR}${CONTAINER_REGISTRY_PLUGIN_NAME} plugin already installed. Updating...${NO_COLOR}"
        bx plugin update ${CONTAINER_REGISTRY_PLUGIN_NAME} -r Bluemix
        echo -e "${GREEN_COLOR}${CONTAINER_REGISTRY_PLUGIN_NAME} plugin updated${NO_COLOR}"
    else
        echo -e "${YELLOW_COLOR}${CONTAINER_REGISTRY_PLUGIN_NAME} plugin not installed. Installing...${NO_COLOR}"
        bx plugin install ${CONTAINER_REGISTRY_PLUGIN_NAME} -r Bluemix
        echo -e "${GREEN_COLOR}${CONTAINER_REGISTRY_PLUGIN_NAME} plugin installed${NO_COLOR}"
    fi
}

function install_kubectl {
    echo -e "${BLUE_COLOR}Check if kubectl is already installed...${NO_COLOR}"
    if ! kubectl help > /dev/null 2>&1; then
        echo -e "${YELLOW_COLOR}kubectl is not installed. Installing...${NO_COLOR}"
        curl -LO https://storage.googleapis.com/kubernetes-release/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl
        chmod +x ./kubectl
        sudo mv ./kubectl /usr/local/bin/kubectl
        echo "${GREEN_COLOR}kubectl installed${NO_COLOR}"
    else
        echo "${GREEN_COLOR}kubectl already installed${NO_COLOR}"
    fi
}

function build_image {
    echo -n "${BLUE_COLOR}Which is version of \"nodejs-cloudant\" image you want to build?${NO_COLOR}"
    read VERSION
    echo -n "${BLUE_COLOR}Building \"registry.ng.bluemix.net/${NAMESPACE}/nodejs-cloudant:${VERSION}\"...${NO_COLOR}"
    docker build -t registry.ng.bluemix.net/${NAMESPACE}/nodejs-cloudant:${VERSION} .
    echo -n "${GREEN_COLOR}\"registry.ng.bluemix.net/${NAMESPACE}/nodejs-cloudant:${VERSION}\" built${NO_COLOR}"
    bx cr login
    CHECK=$(bx cr namespace-list | grep ${NAMESPACE} | wc -l)
    if [[${CHECK} -eq 0 ]; then
        bx cr namespace-add ${NAMESPACE}
    fi
    echo -n "${BLUE_COLOR}Pushing \"registry.ng.bluemix.net/${NAMESPACE}/nodejs-cloudant:${VERSION}\"...${NO_COLOR}"
    docker push registry.ng.bluemix.net/${NAMESPACE}/nodejs-cloudant:${VERSION}
    echo -n "${GREEN_COLOR}\"registry.ng.bluemix.net/${NAMESPACE}/nodejs-cloudant:${VERSION}\" pushed${NO_COLOR}"
}


function provision_kubernetes_secret {
    secretfile="./kubernetes/finalsecret.yml"
    cp  ${SECRET_FILE} ${secretfile}

    bx cf service-key ${CLOUDANT_SERVICE_INSTANCE} ${CLOUDANT_SERVICE_KEY} > tmpCredentialCloudant.json
    lines_to_ignore=$(grep -Fn -m1 '{' tmpCredentialCloudant.json | awk -F':' '{ print $1 }')
    export CLOUDANT_URL=$(tail -n +${lines_to_ignore} tmpCredentialCloudant.json | jq '.credentials.url' )

    substitute_variables_in_secret "./scripts/secret.json"

    insert_secret $secretfile "secret.json" $(cat "./scripts/secret.json")

    set +e
    echo -e "${BLUE_COLOR}Looking for ${SECRET_NAME}...${NO_COLOR}"

    kubectl get secrets ${SECRET_NAME}
    if [[ $? -ne 0 ]]; then
        set -e
        echo "${YELLOW_COLOR}${SECRET_NAME} does not exist. Creating...${NO_COLOR}"
        kubectl apply -f ${secretfile}
        echo "${GREEN_COLOR}${SECRET_NAME} created${NO_COLOR}"
    else
        set -e
        echo -e "${YELLOW_COLOR}${SECRET_NAME} exists. Updating...${NO_COLOR}"
        kubectl apply -f ${secretfile}
        echo -e "${GREEN_COLOR}${SECRET_NAME} updated${NO_COLOR}"
    fi
}


function provision_kubernetes_deployment {
    deployment_file="./kubernetes/finaldeployment.yml"
    cp  ${DEPLOYMENT_FILE} ${deployment_file}

    substitute_variables_in_deployment ${deployment_file}

    echo -e "${BLUE_COLOR}Looking for ${DEPLOYMENT_NAME}...${NO_COLOR}"
    set +e
    kubectl get deploy ${DEPLOYMENT_NAME}

    if [[ $? -ne 0 ]]; then
        set -e
        echo -e "${YELLOW_COLOR}Deployment ${DEPLOYMENT_NAME} does not exist. Creating...${NO_COLOR}"
        kubectl apply -f ${deployment_file} --record
        sleep 90
        completed=$(kubectl describe deploy ${DEPLOYMENT_NAME} | grep 'Available'| wc -l)
        if [[ ${completed} -gt 0 ]]; then
            echo -e "${GREEN_COLOR}Deployment ${DEPLOYMENT_NAME} created${NO_COLOR}"
        else
            echo -e "${RED_COLOR}Deployment ${DEPLOYMENT_NAME} creation failed${NO_COLOR}"
            exit 1
        fi
    else
        set -e
        echo -e "${YELLOW_COLOR}Deployment ${DEPLOYMENT_NAME} exists. Updating...${NO_COLOR}"
        kubectl apply -f ${deployment_file} --record
        sleep 90
        completed=$(kubectl rollout status deployment ${DEPLOYMENT_NAME} --watch=false)
        if [[ ${completed} = *"successfully"* ]]; then
            echo -e "${GREEN_COLOR}Rolling update for deployment ${DEPLOYMENT_NAME} completed successfully${NO_COLOR}"
        else
            echo -e "${RED_COLOR}Rolling update for deployment ${DEPLOYMENT_NAME} fails. Rolling back...${NO_COLOR}"
            echo -e "${RED_COLOR}Roll back completed. Exiting with error${NO_COLOR}"
            exit 1
        fi
    fi
}

function provision_kubernetes_service {
    set +e
    echo -e "${BLUE_COLOR}Looking for ${SERVICE_NAME}...${NO_COLOR}"
    kubectl get services ${SERVICE_NAME}
    if [[ $? -ne 0 ]]; then
        # First deploy
        set -e
        echo -e "${YELLOW_COLOR}Service ${SERVICE_NAME} does not exist. Creating...${NO_COLOR}"
        kubectl apply -f ${SERVICE_FILE}
        echo -e "${GREEN_COLOR}Service ${SERVICE_NAME} created${NO_COLOR}"
    else
        # Service yet existent
        set -e
        echo -e "${YELLOW_COLOR}Service ${SERVICE_NAME} already exists. Updating...${NO_COLOR}"
        kubectl apply -f ${SERVICE_FILE}
        echo -e "${GREEN_COLOR}Service ${SERVICE_NAME} update${NO_COLOR}"
    fi
}

function provision_kubernetes_configmap {
    set +e
    echo -e "${BLUE_COLOR}Looking for ${CONFIGMAP_NAME}...${NO_COLOR}"
    kubectl get configmap ${CONFIGMAP_NAME}
    if [[ $? -ne 0 ]]; then
        # First deploy
        set -e
        echo -e "${YELLOW_COLOR}Configmap ${CONFIGMAP_NAME} does not exist. Creating...${NO_COLOR}"
        kubectl apply -f ${CONFIGMAP_NAME}
        echo -e "${GREEN_COLOR}Configmap ${CONFIGMAP_NAME} created${NO_COLOR}"
    else
        # Service yet existent
        set -e
        echo -e "${YELLOW_COLOR}Configmap ${CONFIGMAP_NAME} already exists. Updating...${NO_COLOR}"
        kubectl apply -f ${CONFIGMAP_FILE}
        echo -e "${GREEN_COLOR}Configmap ${CONFIGMAP_NAME} update${NO_COLOR}"
    fi
}

set +e