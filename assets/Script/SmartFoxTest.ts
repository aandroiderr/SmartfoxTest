// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
// import * as SFS2X from "";

interface InfoMove {
    x?:number;
    y?:number;
}

@ccclass
export default class NewClass extends cc.Component {

    private sfs:SFS2X.SmartFox = null;

    @property(cc.Node)
    heroNode: cc.Node = null;

    @property
    userID: number = 0;


    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    start () {
        cc.log("asfsd");
        var config:SFS2X.IconfigObj = {};
        config.host = "127.0.0.1";
        config.port = 8080;
        config.zone = "BasicExamples";
        config.debug = true;
        config.useSSL = false;

        // Create SmartFox client instance
        this.sfs = new SFS2X.SmartFox(config);

        // Set logging
        this.sfs.logger.level = SFS2X.LogLevel.DEBUG;

        this.sfs.addEventListener(SFS2X.SFSEvent.CONNECTION, this.onConnect, this);
        this.sfs.addEventListener(SFS2X.SFSEvent.LOGIN, this.onLogin, this);
        this.sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, this.onLobbyConnect, this);
        this.sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN_ERROR, this.onRoomConnectError, this);
        this.sfs.addEventListener(SFS2X.SFSEvent.PUBLIC_MESSAGE, this.onPublicMessage, this);

        this.sfs.connect();
    }

    public onConnect(event) {
        cc.log('dfasf');

        // then loggin
        let id = Math.floor(Math.random() * 1000);
        this.sfs.send(new SFS2X.LoginRequest("usname_" + id));
    }

    public onLogin(event) {
        cc.log('asdfasfs');
        // connect to room
        var rooms = this.sfs.roomManager.getRoomList();
        if (rooms.length > 0) {
            this.sfs.send(new SFS2X.JoinRoomRequest(rooms[0]));
        }
    }

    public onLoginError(event) {

    }

    public onLobbyConnect(event) {
        cc.log('asdfasdfd');
        // now user can communicate with others
    }

    public onRoomConnectError(event) {
        cc.log('asdfasf');
    }

    public onKeyDown(event) {
        switch(event.keyCode) {
            case cc.KEY.a:
            case cc.KEY.left:
                console.log('turn left');
                this.moveHeroLeft();
                break;
            case cc.KEY.d:
            case cc.KEY.right:
                console.log('turn right');
                this.moveHeroRight();
                break;
        }
    }

    public onPublicMessage(event: SFS2X.IADMIN_MESSAGE) : void {
        var data = event.data;
        var x = data.getFloat('x');
        var y = data.getFloat('y');
        var sender = (event.sender.isItMe ? "You" : event.sender.name);
        var nick = event.sender.getVariable("nick");
        var aka = (!event.sender.isItMe && nick != null ? " (aka '" + nick.value + "')" : "");
    }

    public moveHeroLeft() {
        this.heroNode.x -= 10;

        var info = new SFS2X.SFSObject();
        info.putFloat('x', this.heroNode.x);
        info.putFloat('y', this.heroNode.y);
        var isSent = this.sfs.send(new SFS2X.PublicMessageRequest('[msg] Move Left', info));
    }

    public moveHeroRight() {
        this.heroNode.x += 10;
    }
}
