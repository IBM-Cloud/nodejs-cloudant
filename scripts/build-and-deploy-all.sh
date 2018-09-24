#!/bin/bash

source ./scripts/common_functions.sh
source ./scripts/containers_functions.sh

set -e

if [ $# -ne 4 ]; then
    echo "syntax is build-and-deploy.sh <api-endpoint> <apikey> <cf-org> <cf-space>"
    exit 1
fi

echo -e "${PURPLE_COLOR}Checking prerequisites...${NO_COLOR}"
check_kubernetes_service_plugin
check_container_registry_plugin
install_kubectl
echo -e "${PURPLE_COLOR}*************************************${NO_COLOR}"
echo -e "\n"

echo -e "${PURPLE_COLOR}Login in IBM Cloud${NO_COLOR}"
bluemix_login $1 $2 $3 $4

echo -e "${PURPLE_COLOR}Starting deploying on Kubernetes cluster${NO_COLOR}"
echo -e "\n"
build_image
provision_kubernetes_secret
provision_kubernetes_configmap
provision_kubernetes_service
provision_kubernetes_deployment
echo -e "${PURPLE_COLOR}App on Kubernetes deployed${NO_COLOR}"

cd ..
echo -e "${PURPLE_COLOR}**************************************************${NO_COLOR}"
echo -e "\n"

echo -e "${PURPLE_COLOR}Logout from IBM Cloud${NO_COLOR}"
bluemix_logout

set +e