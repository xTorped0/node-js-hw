import net from "node:net";
import { log } from "node:console";

import {  serialize, handleRequest, parseRequest } from "./utils.js";
import { PORT } from "../config.js";

net.createServer((socket) => {
	let buf = "";
	socket.on("data", (chunk) => {
		buf += chunk.toString("latin1");
		const req = parseRequest(buf);
		if(!req) return;

		const { method, path, httpVersion, headers } = req;

		socket.write(serialize(handleRequest(req)));
		socket.end();
	});
}).listen(PORT, () => {
	log(`Server is running on ${PORT}`);
});