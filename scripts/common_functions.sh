#!/bin/bash

export PURPLE_COLOR="\033[1;35m"
export BLUE_COLOR="\033[1;94m"
export YELLOW_COLOR="\033[1;93m"
export GREEN_COLOR="\033[1;92m"
export RED_COLOR="\033[1;31m"
export NO_COLOR="\033[0m"

function do_curl {
    HTTP_RESPONSE=$(mktemp)
    HTTP_STATUS=$(curl -w '%{http_code}' -o ${HTTP_RESPONSE} "$@")
    cat ${HTTP_RESPONSE}
    rm -f ${HTTP_RESPONSE}
    if [[ ${HTTP_STATUS} -ge 200 && ${HTTP_STATUS} -lt 300 ]]
    then
        return 0
    else
        return ${HTTP_STATUS}
    fi
}

function bluemix_login {
    bx login -a $1 --apikey $2 -o $3 -s $4
}

function bluemix_logout {
    bx logout
}