FROM ubuntu
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get -y update && \
    apt-get -y install ca-certificates
RUN apt-get install curl -y
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install nodejs -y

RUN apt-get install apt-transport-https ca-certificates curl gnupg lsb-release -y
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
RUN echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

RUN apt-get -y update && \
    apt-get -y install docker-ce docker-ce-cli containerd.io
