# Peerly

A web app to showcase the multiple functionalities of a P2P network

### Requirements

- Yarn

### Deploy

1. `git clone https://github.com/balta-z-r/peerly.git`
2. `cd peerly`
3. `yarn`
4. `yarn build`
5. `yarn start`
6. Launch [localhost:5000](localhost:5000)

### Features

- Crpytocurrency (VectorCoin)
  - Public/Private key pairs for signature verification
  - Multithreading to mine blocks
  - 100% Decentralized P2P network
- Chat & Video Streaming
  - WebRTC (Realtime Connection)
  - ICE Servers

### How it works

The web app is primarily composed of two parts, the backend and the frontend. The backend's main function is to connect the web app with other users on the P2P network. The frontend serves as a user interface for the main features of the P2P network, but also establishes its own connections in the form of WebRTC with the frontends of other users.

#### Backend

The backend uses the js-libp2p library to connect to other peers in the network. It does this first by connecting to a rendezvous server, which as the name suggests, essentially serves as a meeting place for peers to exchange SDP signaling data they can use to connect with each other directly. To this end, the app utilizes NAT traversal to make these direct connections between peers and avoids the problem of needing a public ip address.

##### Protocols

To make sense of the data being sent and received between peers in the network, protocols are used. If you're familiar with RESTful API, protocols in libp2p are very similar to endpoints in REST. This web app uses threee protocols, two of which are for our cryptocurrenct feature and the other one serves as data channel to send and receive signaling data for our frontend browser.

##### Crpytocurrency Protocols

The two main cryptocurrency protocols are the ledger and transaction protocol. Each of them has their own handler function which describes what to do with the data once received.

##### Transaction Protocol

The handler function of our transaction protocol has three main functions. First, it verifies that the transaction being received contains a valid signature and that the person sending it is the same as the person is the same as the person described on the transaction as giving money. Aside from veryfying the signature, the function also makes sure the amount of money being sent does not surpass the amount in the sender's wallet, so as to make sure no one spends more than they have. Lastly, if the first two conditions are met, the function saves the transaction locally on the "ledger.json" file.

##### Ledger Protocol

The ledger protocol works similarly to the transaction protocol, but instread of receiving transactions it receives ledgers from other peers. Once recieved it first checks to make sure all the hashes are correct and that the blockchain is valid. If the blockchain is valid, it then compares it's length to the length of the blockchain locally stored, and if the incoming blockchain is larger, it saves the new blockchain and replaces the old one.

##### Signaling Protocl

The simplest protocol in the web app, the signaling protocl essentially serves as a data channel to pass and receive signaling data. Even though we have already established a P2P connection in the backend, in order to have a faster connection in the frontend, a direct connection between the frontends of two or more peers is desirable. This allows us to video stream with little to no latency.

##### Mining

To allow mining, there is a "nonce" number property to every block .To mine the block you can increment this nonce property starting from zero until the hash of the block starts out with a set number of zeros, described in the difficulty static property of the Blockchain class. The Block class uses the SHA256 algorithm to create the hash. The web app uses built-in NodeJS multithreading to mine blocks in the crtyptocurrency blockchain. Multithreading allows the app to continue sending and receiving to and from peers while still mining the blockchain. The mining process is only stopped if the app receives a valid, new ledger with a size larger than the current one. If, however, the blockchain is mined successfully, the new mined block is added to the blockchain and sent out to all connected peers. If the app is up-to-date with all its other peers, this would entail that its other peers would receive this new blockchain, or ledger, and set it as their own.

##### Signatures

The first time the app is run, it creates a "peer-id.json" file containing an id, a public key and a private key (RSA, 2048 bits). This data is used by js-libp2p to establish safe and encrpyted data channels between peers, but the app also utilizes this pair of keys for our cryptocurrency. Because the id created is a multihash of the private key, the app is able to use the id to identify users in the blockchain and use their public key to verify their id. When creating transactions, in order to validify it, the private key of the user is used to create a signature of the content in the transaction. This signature can then be verified by receivers using the public key of the user. Because a signature is unique to each transaction, one is not able to simply duplicated, or "forge", signatures from one transaction to another.

##### Sockets

In order to communicate to and from the front end, a socket is established. The socket is used to send data such as a list of peers connected, notifications from the backend to be displayed in the frontend, and commands from the frontend to mine the blockchain or to send transactions.

#### Frontend

The frontend is a simple, one-page react app used to display information being sent to the backend in a user-friendly manner. Another key function of the frontend is to establish its own P2P connections in the form of WebRTC to allow for low-latency communication between peers.

##### WebRTC

In order to first esatablish a WebRTC connection between two frontends, they must have a data channel they can use to send and receive signaling data. Similar to a rendezvous server, the front end utilizes the backend to send and recieve signaling data using the signaling protocol to and from peers it wishes to connect to. Once each frontend has received the signaling data of the other frontend, they're able to establish a connection and send data or streams between each other.

##### Chat

Using our WebRTC connection, frontends are able to send and receive messages and hence chat with each other.

##### Video

Similar to the chat system, we can send video streams through our WebRTC connection. Because of the fast nature of WebRTC (because WebRTC uses UDP to communicate), this creates a low-latency video stream and an enjoyable user experience.
