# StorX Reputation Feed

This application maintains the data feed of reputations as updated by the StorX AI. Reputations are a quantitative repreesentation of a farmer node's performance in the storx network.  

Current UI at: https://farmer.storx.io  
Public API available at: https://farmerapi.storx.io    
Public API documentation: https://farmerapi.storx.io/docs.html  


## Running app

The app has been written in Typescript + Node.js

### Envirnment

 - Node.js - v12.0.0 +
 - mongodb - v4.2.8 +

### Setup

 - `npm i --g typescript`
 - `npm i`
 - `cp .env.example .env` & update the .env with appropriate values
 - update [config](./src/config.ts) file with operator account, proper db connections  
 - `npm run build`  
 - running - 
    - production: `npm run start-pm2`
    - dev: `npm run start`  

## Testing

*no test cases have been added as of yet*
## Troubleshooting


Public discussions on the technical issues, post articles and request for Enhancements and Technical Contributions. 

- [Telegram](https://t.me/StorXNetwork)- Stay updated with all the Announcements.
- [Discord](https://discord.gg/ha4Jufj2Nm) - Join the community to find answers to all your questions.
- [Reddit](https://www.reddit.com/r/StorXNetwork) - Join the channel to have a healthy interaction with the community.
- [GitHub](https://github.com/StorXNetwork) - Join the developers community on GitHub
