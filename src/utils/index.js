import bunyan from "bunyan";

export const defValues = (isUpdate) => {
  const date = new Date();
  return !isUpdate
    ? {
        createdAt: date,
        updatedAt: date,
      }
    : {
        updatedAt: date,
      };
};

export const excludeDef = () => {
  return ["createdAt", "updatedAt", "createdUsu", "updatedUsu"];
};

export const logger = bunyan.createLogger({
  name: "logger",
  src: true,
  serializers: {
    err: bunyan.stdSerializers.err,
  },
});
