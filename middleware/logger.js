import axios from "axios";

const LOG_SERVER = "http://20.244.56.144/evaluation-service/logs";

export default async function log(stack, level, pkg, message) {
  try {
    const res = await axios.post(LOG_SERVER, {
      stack,
      level,
      package: pkg,
      message,
    });
    return res.data;
  } catch (error) {
    console.error("Login failed:", error.message);
  }
}
