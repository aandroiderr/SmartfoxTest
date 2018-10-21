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

    @property(cc.Node)
    opponentNode: cc.Node = null;

    @property
    userID: number = 0;


    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.initHero();
        this.opponentNode.active = false;
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
        this.sfs.addEventListener(SFS2X.SFSEvent.USER_ENTER_ROOM, this.onUserEnterRoom, this);
        this.sfs.addEventListener(SFS2X.SFSEvent.USER_EXIT_ROOM, this.onUserExitRoom, this);

        this.sfs.connect();
    }

    public initHero() {
        this.heroNode.x = 100 + Math.floor(Math.random() * 200);
        this.heroNode.y = 100 + Math.floor(Math.random() * 200);  
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

        // Check if opponent existed or not
        if (this.sfs.userManager.getUserCount() > 1) {
            this.opponentNode.active = true;
        }

        // Tell opponent my pos
        this.broadcastUserInfo(this.heroNode.x, this.heroNode.y);
    }

    public onRoomConnectError(event) {
        cc.log('asdfasf');
    }

    public onUserEnterRoom(event) {
        cc.log('sdfasfsaf');

        // Add opponent
        this.opponentNode.active = true;
    }

    public onUserExitRoom(event) {
        cc.log('asdfsadf');

        // Remove opponent
        this.opponentNode.active = false;
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

        if (!event.sender.isItMe) {
            this.updateOpponentInfo(data);
        }
    }

    public moveHeroLeft() {
        this.heroNode.x -= 10;
        this.broadcastUserInfo(this.heroNode.x, this.heroNode.y);
    }

    public moveHeroRight() {
        this.heroNode.x += 10;
        this.broadcastUserInfo(this.heroNode.x, this.heroNode.y);
    }

    public broadcastUserInfo(x: number, y: number) {
        var info = new SFS2X.SFSObject();
        info.putFloat('x', x);
        info.putFloat('y', y);
        var isSent = this.sfs.send(new SFS2X.PublicMessageRequest('[msg] Move', info));
    }

    public updateOpponentInfo(data: SFS2X.SFSObject) {   
        var x = data.getFloat('x');
        var y = data.getFloat('y');    
        this.opponentNode.setPosition(x , y);
    }
}
