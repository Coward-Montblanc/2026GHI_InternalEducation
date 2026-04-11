import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Appliance shop api",
      version: "1.0.0",
      description: "家電製品販売ホームページapi"
    },
    servers: [
      {
        url: "http://localhost:3000/api" //ポート番号確認後チームメンバーと一致させると楽
      }
    ]
  },
  apis: ["./src/routes/*.js",
    "./src/docs/swagger/*.js"
  ] // ここでAPIコメントを読む
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;