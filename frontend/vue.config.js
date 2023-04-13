const { defineConfig } = require('@vue/cli-service')
const path = require('path');
console.log("VUE_APP_HOST:", process.env.VUE_APP_HOST);
module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: path.resolve(__dirname, '../backend/wwwroot/public/'),
  devServer: {
    // 프록시 설정
    proxy: {
      // 프록시 요청을 보낼 api의 시작 부분
      '/api': {
          // 프록시 요청을 보낼 서버의 주소
          target: process.env.VUE_APP_HOST
      }
    }
  }
});