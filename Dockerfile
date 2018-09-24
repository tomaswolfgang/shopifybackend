From node:latest
RUN mkdir -p /usr/src/app
COPY ["package.json", "/usr/src/app"]
WORKDIR /usr/src/app
RUN ["npm", "install"]
RUN ["npm", "rebuild", "bcrypt", "--update-binary"]
COPY . /usr/src/app
EXPOSE 3000
CMD ["npm", "start"]
