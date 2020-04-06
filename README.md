# Inhuman Conditions Online

Play Inhuman Conditions online across multiple devices. [https://inhumanconditions.net/](https://inhumanconditions.net/)

[Inhuman Conditions][ih] by Tommy Maranges and Cory O’Brien is licensed under [CC BY-NC-SA 4.0][cc].

[ih]: https://robots.management/
[cc]: http://creativecommons.org/licenses/by-nc-sa/4.0/

"Inhuman Conditions Online" is also available under the same CC BY-NC-SA 4.0 license.

Run `npm i` to install server-side dependencies (socket.io and express) and then `node server` to run the server.

The core game code is all on the client side. The server is a thin wrapper around [socket.io][io] to proxy messages to all clients in the same room.

[io]: https://socket.io/

The client side is implemented in [Preact](https://preactjs.com/) + [HTM](https://github.com/developit/htm) with hooks. All client-side code is in the index.html file. There is no client-side build step.

Players give their names when they arrive, and then appear in the lobby.