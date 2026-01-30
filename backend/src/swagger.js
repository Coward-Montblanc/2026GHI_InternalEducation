import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Appliance shop api",
      version: "1.0.0",
      description: "가전제품 판매 홈페이지 api"
    },
    servers: [
      {
        url: "http://localhost:3000/api" //포트번호 확인 후 팀원과 일치시키면 편함
      }
    ]
  },
  apis: ["./src/routes/*.js"] // 여기에 API 주석을 읽음
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;