# Common build stage
FROM node:16.3.0-alpine as common-build-stage

WORKDIR /app

COPY package.json .

RUN apk update && apk --no-cache --update add dcron

RUN npm install
COPY . .

RUN npm install pm2 -g
RUN npm run prisma:generate
RUN npm run build
EXPOSE 3001

# Development build stage
FROM common-build-stage as development-build-stage
WORKDIR /app
COPY --from=common-build-stage /app/dist .
ENV NODE_ENV development

ENV NODE_ENV development

RUN crontab -l | { cat; echo "0 06 * * * npm --prefix /app run job:listing:about:to:expire:check:prod >> /var/log/cron.log 2>&1"; } | crontab - 
RUN crontab -l | { cat; echo "0 00,12 * * * npm --prefix /app run job:expire:activate:package:dev >> /var/log/cron.log 2>&1"; } | crontab - 
RUN crontab -l | { cat; echo "0 03 * * * npm --prefix /app run job:archive:chat:prod >> /var/log/cron.log 2>&1"; } | crontab -
RUN crontab -l | { cat; echo "*/10 * * * * npm --prefix /app run job:notify:not:seen:chat:msg:prod >> /var/log/cron.log 2>&1"; } | crontab - 
RUN crontab -l | { cat; echo "30 03 * * *  npm --prefix /app run job:dismiss:flagged:expired:listings:prod >> /var/log/cron.log 2>&1"; } | crontab -

#RUN chmod +x ./entrypoint-dev.sh

#CMD ["npm", "run", "deploy:dev"]
CMD ["pm2-runtime", "start" ,"ecosystem.config.js", "--only", "dev"]
#ENTRYPOINT ["./entrypoint-dev.sh"]

# Stress build stage
#FROM common-build-stage as stress-build-stage

#ENV NODE_ENV stress

#CMD ["pm2-runtime", "ecosystem.stress.config.js"]

# Production build stage
#FROM common-build-stage as production-build-stage

#ENV NODE_ENV production

#RUN chmod +x ./entrypoint-prod.sh
#RUN crontab -l | { cat; echo "0 06 * * * npm --prefix /app run job:listing:about:to:expire:check:prod >> /var/log/cron.log 2>&1"; } | crontab -
#RUN crontab -l | { cat; echo "0 00,12 * * * npm --prefix /app run job:expire:activate:package:prod >> /var/log/cron.log 2>&1"; } | crontab -
#RUN crontab -l | { cat; echo "0 03 * * * npm --prefix /app run job:archive:chat:prod >> /var/log/cron.log 2>&1"; } | crontab -
#RUN crontab -l | { cat; echo "*/10 * * * * npm --prefix /app run job:notify:not:seen:chat:msg:prod >> /var/log/cron.log 2>&1"; } | crontab -
#RUN crontab -l | { cat; echo "30 03 * * *  npm --prefix /app run job:dismiss:flagged:expired:listings:prod >> /var/log/cron.log 2>&1"; } | crontab -

# CMD ["pm2-runtime", "ecosystem.production.config.js"]

#ENTRYPOINT ["./entrypoint-prod.sh"]

