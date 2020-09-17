var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
/***
 * AMF 3 JavaScript library by Emil Malinov https://github.com/emilkm/amfjs
 */
var amf;
(function (amf) {
    var CONST = {
        EMPTY_STRING: "",
        NULL_STRING: "null",
        UNDEFINED_TYPE: 0,
        NULL_TYPE: 1,
        FALSE_TYPE: 2,
        TRUE_TYPE: 3,
        INTEGER_TYPE: 4,
        DOUBLE_TYPE: 5,
        STRING_TYPE: 6,
        XML_TYPE: 7,
        DATE_TYPE: 8,
        ARRAY_TYPE: 9,
        OBJECT_TYPE: 10,
        XMLSTRING_TYPE: 11,
        BYTEARRAY_TYPE: 12,
        AMF0_AMF3: 17,
        UINT29_MASK: 536870911,
        INT28_MAX_VALUE: 268435455,
        INT28_MIN_VALUE: -268435456,
        CLASS_ALIAS: "_explicitType",
        EXTERNALIZED_FIELD: "_externalizedData"
    };
    var requestPoolSize = 6;
    var requestPool = [];
    var doNothing = function () { };
    var ActionMessage = (function () {
        function ActionMessage() {
            this._explicitType = "flex.messaging.io.amf.ActionMessage";
            this.version = 3;
            this.headers = [];
            this.bodies = [];
        }
        return ActionMessage;
    }());
    amf.ActionMessage = ActionMessage;
    __reflect(ActionMessage.prototype, "amf.ActionMessage");
    var MessageBody = (function () {
        function MessageBody() {
            this.targetURI = "null";
            this.responseURI = '/1';
            this.data = [];
        }
        return MessageBody;
    }());
    amf.MessageBody = MessageBody;
    __reflect(MessageBody.prototype, "amf.MessageBody");
    var MessageHeader = (function () {
        function MessageHeader() {
            this.name = "";
            this.mustUnderstand = false;
            this.data = null;
        }
        return MessageHeader;
    }());
    amf.MessageHeader = MessageHeader;
    __reflect(MessageHeader.prototype, "amf.MessageHeader");
    var CommandMessage = (function () {
        function CommandMessage() {
            this._explicitType = "flex.messaging.messages.CommandMessage";
            this.destination = '';
            this.operation = 5;
            this.clientId = null;
        }
        return CommandMessage;
    }());
    amf.CommandMessage = CommandMessage;
    __reflect(CommandMessage.prototype, "amf.CommandMessage");
    var RemotingMessage = (function () {
        function RemotingMessage() {
            this._explicitType = "flex.messaging.messages.RemotingMessagee";
            this.destination = '';
            this.source = '';
            this.operation = '';
            this.body = [],
                this.headers = { DSId: "nil" },
                this.clientId = null;
        }
        return RemotingMessage;
    }());
    amf.RemotingMessage = RemotingMessage;
    __reflect(RemotingMessage.prototype, "amf.RemotingMessage");
    var AcknowledgeMessage = (function () {
        function AcknowledgeMessage() {
            this._explicitType = "flex.messaging.messages.AcknowledgeMessage";
            this.body = null,
                this.headers = [],
                this.messageId = null;
            this.clientId = null;
        }
        return AcknowledgeMessage;
    }());
    amf.AcknowledgeMessage = AcknowledgeMessage;
    __reflect(AcknowledgeMessage.prototype, "amf.AcknowledgeMessage");
    var Request = (function () {
        function Request(source, operation, params, onResult, onStatus, token, holdQueue) {
            this.source = source,
                this.operation = operation,
                this.params = params,
                this.onResult = onResult,
                this.onStatus = onStatus,
                this.token = token,
                this.holdQueue = holdQueue;
        }
        return Request;
    }());
    amf.Request = Request;
    __reflect(Request.prototype, "amf.Request");
    var Writer = (function () {
        function Writer() {
            this.write = function (v) {
                this.data.push(v);
            };
            this.writeShort = function (v) {
                this.write((v >>> 8) & 255);
                this.write((v >>> 0) & 255);
            };
            this.writeUTF = function (v, asAmf) {
                var bytearr, c, i, strlen, utflen;
                strlen = v.length;
                utflen = 0;
                for (i = 0; i < strlen; i++) {
                    c = v.charCodeAt(i);
                    if (c > 0 && c < 128) {
                        utflen++;
                    }
                    else if (c > 2047) {
                        utflen += 3;
                    }
                    else {
                        utflen += 2;
                    }
                }
                bytearr = [];
                if (asAmf) {
                    this.writeUInt29((utflen << 1) | 1);
                }
                else {
                    bytearr.push((utflen >>> 8) & 255);
                    bytearr.push(utflen & 255);
                }
                for (i = 0; i < strlen; i++) {
                    c = v.charCodeAt(i);
                    if (c > 0 && c < 128) {
                        bytearr.push(c);
                    }
                    else if (c > 2047) {
                        bytearr.push(224 | (c >> 12));
                        bytearr.push(128 | ((c >> 6) & 63));
                        if (asAmf) {
                            bytearr.push(128 | ((c >> 0) & 63));
                        }
                        else {
                            bytearr.push(128 | (c & 63));
                        }
                    }
                    else {
                        bytearr.push(192 | (c >> 6));
                        if (asAmf) {
                            bytearr.push(128 | ((c >> 0) & 63));
                        }
                        else {
                            bytearr.push(128 | (c & 63));
                        }
                    }
                }
                this.writeAll(bytearr);
                return asAmf ? utflen : utflen + 2;
            };
            this.writeUInt29 = function (v) {
                if (v < 128) {
                    this.write(v);
                }
                else if (v < 16384) {
                    this.write(((v >> 7) & 127) | 128);
                    this.write(v & 127);
                }
                else if (v < 2097152) {
                    this.write(((v >> 14) & 127) | 128);
                    this.write(((v >> 7) & 127) | 128);
                    this.write(v & 127);
                }
                else if (v < 0x40000000) {
                    this.write(((v >> 22) & 127) | 128);
                    this.write(((v >> 15) & 127) | 128);
                    this.write(((v >> 8) & 127) | 128);
                    this.write(v & 255);
                }
                else {
                    throw "Integer out of range: " + v;
                }
            };
            this.writeAll = function (bytes) {
                for (var i = 0; i < bytes.length; i++) {
                    this.write(bytes[i]);
                }
            };
            this.writeBoolean = function (v) {
                this.write(v ? 1 : 0);
            };
            this.writeInt = function (v) {
                this.write((v >>> 24) & 255);
                this.write((v >>> 16) & 255);
                this.write((v >>> 8) & 255);
                this.write((v >>> 0) & 255);
            };
            this.writeUnsignedInt = function (v) {
                v < 0 && (v = -(v ^ 4294967295) - 1);
                v &= 4294967295;
                this.write((v >> 24) & 255);
                this.write((v >> 16) & 255);
                this.write((v >> 8) & 255);
                this.write(v & 255);
            };
            //origin unknown
            this._getDouble = function (v) {
                var r = [0, 0];
                if (v != v)
                    return r[0] = -524288, r;
                var d = v < 0 || v === 0 && 1 / v < 0 ? -2147483648 : 0, v = Math.abs(v);
                if (v === Number.POSITIVE_INFINITY)
                    return r[0] = d | 2146435072, r;
                for (var e = 0; v >= 2 && e <= 1023;)
                    e++, v /= 2;
                for (; v < 1 && e >= -1022;)
                    e--, v *= 2;
                e += 1023;
                if (e == 2047)
                    return r[0] = d | 2146435072, r;
                var i;
                e == 0
                    ? (i = v * Math.pow(2, 23) / 2, v = Math.round(v * Math.pow(2, 52) / 2))
                    : (i = v * Math.pow(2, 20) - Math.pow(2, 20), v = Math.round(v * Math.pow(2, 52) - Math.pow(2, 52)));
                r[0] = d | e << 20 & 2147418112 | i & 1048575;
                r[1] = v;
                return r;
            };
            this.writeDouble = function (v) {
                v = this._getDouble(v);
                this.writeUnsignedInt(v[0]);
                this.writeUnsignedInt(v[1]);
            };
            this.getResult = function () {
                return this.data.join("");
            };
            this.reset = function () {
                this.objects = [];
                this.objectCount = 0;
                this.traits = {};
                this.traitCount = 0;
                this.strings = {};
                this.stringCount = 0;
            };
            this.writeStringWithoutType = function (v) {
                if (v.length == 0) {
                    this.writeUInt29(1);
                }
                else {
                    if (!this.stringByReference(v)) {
                        this.writeUTF(v, true);
                    }
                }
            };
            this.stringByReference = function (v) {
                var ref = this.strings[v];
                if (ref) {
                    this.writeUInt29(ref << 1);
                }
                else {
                    this.strings[v] = this.stringCount++;
                }
                return ref;
            };
            this.objectByReference = function (v) {
                var ref = 0;
                var found = false;
                for (; ref < this.objects.length; ref++) {
                    if (this.objects[ref] === v) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    this.writeUInt29(ref << 1);
                }
                else {
                    this.objects.push(v);
                    this.objectCount++;
                }
                return found ? ref : null;
            };
            this.traitsByReference = function (v, alias) {
                var s = alias + "|";
                for (var i = 0; i < v.length; i++) {
                    s += v[i] + "|";
                }
                var ref = this.traits[s];
                if (ref) {
                    this.writeUInt29((ref << 2) | 1);
                }
                else {
                    this.traits[s] = this.traitCount++;
                }
                return ref;
            };
            this.writeAmfInt = function (v) {
                if (v >= CONST.INT28_MIN_VALUE && v <= CONST.INT28_MAX_VALUE) {
                    v = v & CONST.UINT29_MASK;
                    this.write(CONST.INTEGER_TYPE);
                    this.writeUInt29(v);
                }
                else {
                    this.write(CONST.DOUBLE_TYPE);
                    this.writeDouble(v);
                }
            };
            this.writeDate = function (v) {
                this.write(CONST.DATE_TYPE);
                if (!this.objectByReference(v)) {
                    this.writeUInt29(1);
                    this.writeDouble(v.getTime());
                }
            };
            this.writeObject = function (v) {
                if (v == null) {
                    this.write(CONST.NULL_TYPE);
                    return;
                }
                if (v.constructor === String) {
                    this.write(CONST.STRING_TYPE);
                    this.writeStringWithoutType(v);
                }
                else if (v.constructor === Number) {
                    if (v === +v && v === (v | 0)) {
                        this.writeAmfInt(v);
                    }
                    else {
                        this.write(CONST.DOUBLE_TYPE);
                        this.writeDouble(v);
                    }
                }
                else if (v.constructor === Boolean) {
                    this.write((v
                        ? CONST.TRUE_TYPE
                        : CONST.FALSE_TYPE));
                }
                else if (v.constructor === Date) {
                    this.writeDate(v);
                }
                else {
                    if (v.constructor === Array) {
                        this.writeArray(v);
                    }
                    else if (CONST.CLASS_ALIAS in v) {
                        this.writeCustomObject(v);
                    }
                    else {
                        this.writeMap(v);
                    }
                }
            };
            this.writeCustomObject = function (v) {
                this.write(CONST.OBJECT_TYPE);
                if (!this.objectByReference(v)) {
                    var traits = this.writeTraits(v);
                    for (var i = 0; i < traits.length; i++) {
                        var prop = traits[i];
                        this.writeObject(v[prop]);
                    }
                }
            };
            this.writeTraits = function (v) {
                var traits = [];
                var count = 0;
                var externalizable = false;
                var dynamic = false;
                for (var t in v) {
                    if (t != CONST.CLASS_ALIAS) {
                        traits.push(t);
                        count++;
                    }
                }
                if (!this.traitsByReference(traits, v[CONST.CLASS_ALIAS])) {
                    this.writeUInt29(3 | (externalizable ? 4 : 0) | (dynamic ? 8 : 0) | (count << 4));
                    this.writeStringWithoutType(v[CONST.CLASS_ALIAS]);
                    if (count > 0) {
                        for (var prop in traits) {
                            this.writeStringWithoutType(traits[prop]);
                        }
                    }
                }
                return traits;
            };
            /* Write map as array
            writeMap = function(v) {
                this.write(CONST.ARRAY_TYPE);
                if (!this.objectByReference(map)) {
                    this.writeUInt29((0 << 1) | 1);
                    for (var key in v) {
                        if (key) {
                            this.writeStringWithoutType(key);
                        } else {
                            this.writeStringWithoutType(CONST.EMPTY_STRING);
                        }
                        this.writeObject(v[key]);
                    }
                    this.writeStringWithoutType(CONST.EMPTY_STRING);
                }
            };*/
            this.writeMap = function (v) {
                this.write(CONST.OBJECT_TYPE);
                if (!this.objectByReference(v)) {
                    this.writeUInt29(11);
                    this.traitCount++; //bogus traits entry here
                    this.writeStringWithoutType(CONST.EMPTY_STRING); //class name
                    for (var key in v) {
                        if (key) {
                            this.writeStringWithoutType(key);
                        }
                        else {
                            this.writeStringWithoutType(CONST.EMPTY_STRING);
                        }
                        this.writeObject(v[key]);
                    }
                    this.writeStringWithoutType(CONST.EMPTY_STRING); //empty string end of dynamic members
                }
            };
            this.writeArray = function (v) {
                this.write(CONST.ARRAY_TYPE);
                if (!this.objectByReference(v)) {
                    this.writeUInt29((v.length << 1) | 1);
                    this.writeUInt29(1); //empty string implying no named keys
                    if (v.length > 0) {
                        for (var i = 0; i < v.length; i++) {
                            this.writeObject(v[i]);
                        }
                    }
                }
            };
            this.data = [];
            this.objects = [];
            this.traits = {};
            this.strings = {};
            this.stringCount = 0;
            this.traitCount = 0;
            this.objectCount = 0;
        }
        return Writer;
    }());
    amf.Writer = Writer;
    __reflect(Writer.prototype, "amf.Writer");
    var Reader = (function () {
        function Reader(data) {
            this.read = function () {
                return this.data[this.pos++];
            };
            this.readUnsignedShort = function () {
                var c1 = this.read(), c2 = this.read();
                return (c1 << 8) + (c2 << 0);
            };
            this.readUInt29 = function () {
                // Each byte must be treated as unsigned
                var b = this.read() & 255;
                if (b < 128) {
                    return b;
                }
                var value = (b & 127) << 7;
                b = this.read() & 255;
                if (b < 128) {
                    return (value | b);
                }
                value = (value | (b & 127)) << 7;
                b = this.read() & 255;
                if (b < 128) {
                    return (value | b);
                }
                value = (value | (b & 127)) << 8;
                b = this.read() & 255;
                return (value | b);
            };
            this.readFully = function (buff, start, length) {
                for (var i = start; i < length; i++) {
                    buff[i] = this.read();
                }
            };
            this.readUTF = function (length) {
                var utflen = length ? length : this.readUnsignedShort();
                var chararr = [];
                var p = this.pos;
                var c1, c2, c3;
                while (this.pos < p + utflen) {
                    c1 = this.read();
                    switch (c1 >> 4) {
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                        case 7:
                            chararr.push(String.fromCharCode(c1));
                            break;
                        case 12:
                        case 13:
                            c2 = this.read();
                            chararr.push(String.fromCharCode(((c1 & 31) << 6) | (c2 & 63)));
                            break;
                        case 14:
                            c2 = this.read();
                            c3 = this.read();
                            chararr.push(String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | ((c3 & 63) << 0)));
                            break;
                        case 8:
                        case 9:
                        case 10:
                        case 11:
                        default:
                            break;
                    }
                    /*if (c1 < 128) {
                        chararr.push(String.fromCharCode(c1));
                    } else if (c1 > 2047) {
                        c2 = this.read();
                        c3 = this.read();
                        chararr.push(String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
                    } else {
                        c2 = this.read();
                        chararr.push(String.fromCharCode(((c1 & 31) << 6) | (c2 & 63)));
                    }*/
                }
                // The number of chars produced may be less than utflen
                return chararr.join("");
            };
            this.reset = function () {
                this.objects = [];
                this.traits = [];
                this.strings = [];
            };
            this.readObject = function () {
                var type = this.read();
                return this.readObjectValue(type);
            };
            this.readString = function () {
                var ref = this.readUInt29();
                if ((ref & 1) == 0) {
                    return this.getString(ref >> 1);
                }
                else {
                    var len = (ref >> 1);
                    if (len == 0) {
                        return CONST.EMPTY_STRING;
                    }
                    var str = this.readUTF(len);
                    this.rememberString(str);
                    return str;
                }
            };
            this.rememberString = function (v) {
                this.strings.push(v);
            };
            this.getString = function (v) {
                return this.strings[v];
            };
            this.getObject = function (v) {
                return this.objects[v];
            };
            this.getTraits = function (v) {
                return this.traits[v];
            };
            this.rememberTraits = function (v) {
                this.traits.push(v);
            };
            this.rememberObject = function (v) {
                this.objects.push(v);
            };
            this.readTraits = function (ref) {
                if ((ref & 3) == 1) {
                    return this.getTraits(ref >> 2);
                }
                else {
                    var count = (ref >> 4);
                    var className = this.readString();
                    var traits = {};
                    if (className != null && className != "") {
                        traits[CONST.CLASS_ALIAS] = className;
                    }
                    traits.props = [];
                    for (var i = 0; i < count; i++) {
                        traits.props.push(this.readString());
                    }
                    this.rememberTraits(traits);
                    return traits;
                }
            };
            this.readScriptObject = function () {
                var ref = this.readUInt29();
                if ((ref & 1) == 0) {
                    return this.getObject(ref >> 1);
                }
                else {
                    var traits = this.readTraits(ref);
                    var obj = {};
                    if (CONST.CLASS_ALIAS in traits) {
                        obj[CONST.CLASS_ALIAS] = traits[CONST.CLASS_ALIAS];
                    }
                    this.rememberObject(obj);
                    if ((ref & 4) == 4) {
                        if (obj[CONST.CLASS_ALIAS] == "flex.messaging.io.ArrayCollection"
                            || obj[CONST.CLASS_ALIAS] == "flex.messaging.io.ObjectProxy") {
                            return this.readObject();
                        }
                        else {
                            obj[CONST.EXTERNALIZED_FIELD] = this.readObject();
                        }
                    }
                    else {
                        for (var i in traits.props) {
                            obj[traits.props[i]] = this.readObject();
                        }
                        if ((ref & 8) == 8) {
                            for (;;) {
                                var name = this.readString();
                                if (name == null || name.length == 0) {
                                    break;
                                }
                                obj[name] = this.readObject();
                            }
                        }
                    }
                    return obj;
                }
            };
            this.readArray = function () {
                var ref = this.readUInt29();
                if ((ref & 1) == 0) {
                    return this.getObject(ref >> 1);
                }
                var len = (ref >> 1);
                var map = null, i = 0;
                while (true) {
                    var name = this.readString();
                    if (!name) {
                        break;
                    }
                    if (!map) {
                        map = {};
                        this.rememberObject(map);
                    }
                    map[name] = this.readObject();
                }
                if (!map) {
                    var array = new Array(len);
                    this.rememberObject(array);
                    for (i = 0; i < len; i++) {
                        array[i] = this.readObject();
                    }
                    return array;
                }
                else {
                    for (i = 0; i < len; i++) {
                        map[i] = this.readObject();
                    }
                    return map;
                }
            };
            //origin unknown
            this.readDouble = function () {
                var c1 = this.read() & 255, c2 = this.read() & 255;
                if (c1 === 255) {
                    if (c2 === 248)
                        return Number.NaN;
                    if (c2 === 240)
                        return Number.NEGATIVE_INFINITY;
                }
                else if (c1 === 127 && c2 === 240)
                    return Number.POSITIVE_INFINITY;
                var c3 = this.read() & 255, c4 = this.read() & 255, c5 = this.read() & 255, c6 = this.read() & 255, c7 = this.read() & 255, c8 = this.read() & 255;
                if (!c1 && !c2 && !c3 && !c4)
                    return 0;
                for (var d = (c1 << 4 & 2047 | c2 >> 4) - 1023, c2 = ((c2 & 15) << 16 | c3 << 8 | c4).toString(2), c3 = c2.length; c3 < 20; c3++)
                    c2 = "0" + c2;
                c6 = ((c5 & 127) << 24 | c6 << 16 | c7 << 8 | c8).toString(2);
                for (c3 = c6.length; c3 < 31; c3++)
                    c6 = "0" + c6;
                c5 = parseInt(c2 + (c5 >> 7 ? "1" : "0") + c6, 2);
                if (c5 == 0 && d == -1023)
                    return 0;
                return (1 - (c1 >> 7 << 1)) * (1 + Math.pow(2, -52) * c5) * Math.pow(2, d);
            };
            this.readDate = function () {
                var ref = this.readUInt29();
                if ((ref & 1) == 0) {
                    return this.getObject(ref >> 1);
                }
                var time = this.readDouble();
                var date = new Date(time);
                this.rememberObject(date);
                return date;
            };
            this.readMap = function () {
                var ref = this.readUInt29();
                if ((ref & 1) == 0) {
                    return this.getObject(ref >> 1);
                }
                var length = (ref >> 1);
                var map = null;
                if (length > 0) {
                    map = {};
                    this.rememberObject(map);
                    var name = this.readObject();
                    while (name != null) {
                        map[name] = this.readObject();
                        name = this.readObject();
                    }
                }
                return map;
            };
            this.readByteArray = function () {
                var ref = this.readUInt29();
                if ((ref & 1) == 0) {
                    return this.getObject(ref >> 1);
                }
                else {
                    var len = (ref >> 1);
                    var ba = [];
                    this.readFully(ba, 0, len);
                    this.rememberObject(ba);
                    return ba;
                }
            };
            this.readObjectValue = function (type) {
                var value = null;
                switch (type) {
                    case CONST.STRING_TYPE:
                        value = this.readString();
                        break;
                    case CONST.OBJECT_TYPE:
                        try {
                            value = this.readScriptObject();
                        }
                        catch (e) {
                            throw "Failed to deserialize:" + e;
                        }
                        break;
                    case CONST.ARRAY_TYPE:
                        value = this.readArray();
                        //value = this.readMap();
                        break;
                    case CONST.FALSE_TYPE:
                        value = false;
                        break;
                    case CONST.TRUE_TYPE:
                        value = true;
                        break;
                    case CONST.INTEGER_TYPE:
                        value = this.readUInt29();
                        // Symmetric with writing an integer to fix sign bits for
                        // negative values...
                        value = (value << 3) >> 3;
                        break;
                    case CONST.DOUBLE_TYPE:
                        value = this.readDouble();
                        break;
                    case CONST.UNDEFINED_TYPE:
                    case CONST.NULL_TYPE:
                        break;
                    case CONST.DATE_TYPE:
                        value = this.readDate();
                        break;
                    case CONST.BYTEARRAY_TYPE:
                        value = this.readByteArray();
                        break;
                    case CONST.AMF0_AMF3:
                        value = this.readObject();
                        break;
                    default:
                        throw "Unknown AMF type: " + type;
                }
                return value;
            };
            this.readBoolean = function () {
                return this.read() === 1;
            };
            this.objects = [];
            this.traits = [];
            this.strings = [];
            this.data = data;
            this.pos = 0;
        }
        return Reader;
    }());
    amf.Reader = Reader;
    __reflect(Reader.prototype, "amf.Reader");
    var Serializer = (function () {
        function Serializer() {
            this.writeMessage = function (message) {
                try {
                    this.writer.writeShort(message.version);
                    this.writer.writeShort(message.headers.length);
                    for (var header in message.headers) {
                        this.writeHeader(message.headers[header]);
                    }
                    this.writer.writeShort(message.bodies.length);
                    for (var body in message.bodies) {
                        this.writeBody(message.bodies[body]);
                    }
                }
                catch (error) {
                    console.log(error);
                }
                //return this.writer.getResult();
                return this.writer.data;
            };
            this.writeObject = function (object) {
                this.writer.writeObject(object);
            };
            this.writeHeader = function (header) {
                this.writer.writeUTF(header.name);
                this.writer.writeBoolean(header.mustUnderstand);
                this.writer.writeInt(1); //UNKNOWN_CONTENT_LENGTH used to be -1
                this.writer.reset();
                //this.writer.writeObject(header.data);
                this.writer.write(1); //boolean amf0 marker
                this.writer.writeBoolean(true);
            };
            this.writeBody = function (body) {
                if (body.targetURI == null) {
                    this.writer.writeUTF(CONST.NULL_STRING);
                }
                else {
                    this.writer.writeUTF(body.targetURI);
                }
                if (body.responseURI == null) {
                    this.writer.writeUTF(CONST.NULL_STRING);
                }
                else {
                    this.writer.writeUTF(body.responseURI);
                }
                this.writer.writeInt(1); //UNKNOWN_CONTENT_LENGTH used to be -1
                this.writer.reset();
                this.writer.write(CONST.AMF0_AMF3); //AMF0_AMF3
                this.writeObject(body.data);
            };
            this.writer = new Writer();
        }
        return Serializer;
    }());
    amf.Serializer = Serializer;
    __reflect(Serializer.prototype, "amf.Serializer");
    var Deserializer = (function () {
        function Deserializer(data) {
            this.readMessage = function () {
                var message = new ActionMessage();
                message.version = this.reader.readUnsignedShort();
                var headerCount = this.reader.readUnsignedShort();
                for (var i = 0; i < headerCount; i++) {
                    message.headers.push(this.readHeader());
                }
                var bodyCount = this.reader.readUnsignedShort();
                for (i = 0; i < bodyCount; i++) {
                    message.bodies.push(this.readBody());
                }
                return message;
            };
            this.readHeader = function () {
                var header = new MessageHeader();
                header.name = this.reader.readUTF();
                header.mustUnderstand = this.reader.readBoolean();
                this.reader.pos += 4; //length
                this.reader.reset();
                var type = this.reader.read();
                if (type != 2) {
                    throw "Only string header data supported.";
                }
                header.data = this.reader.readUTF();
                return header;
            };
            this.readBody = function () {
                var body = new MessageBody();
                body.targetURI = this.reader.readUTF();
                body.responseURI = this.reader.readUTF();
                this.reader.pos += 4; //length
                this.reader.reset();
                body.data = this.readObject();
                return body;
            };
            this.readObject = function () {
                return this.reader.readObject();
            };
            this.reader = new Reader(data);
        }
        return Deserializer;
    }());
    amf.Deserializer = Deserializer;
    __reflect(Deserializer.prototype, "amf.Deserializer");
})(amf || (amf = {}));
;
/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */
(function () {
    'use strict';
    function l(d) {
        throw d;
    }
    var v = void 0, x = !0, aa = this;
    function D(d, a) {
        var c = d.split("."), e = aa;
        !(c[0] in e) && e.execScript && e.execScript("var " + c[0]);
        for (var b; c.length && (b = c.shift());)
            !c.length && a !== v ? e[b] = a : e = e[b] ? e[b] : e[b] = {};
    }
    ;
    var F = "undefined" !== typeof Uint8Array && "undefined" !== typeof Uint16Array && "undefined" !== typeof Uint32Array && "undefined" !== typeof DataView;
    function H(d, a) {
        this.index = "number" === typeof a ? a : 0;
        this.i = 0;
        this.buffer = d instanceof (F ? Uint8Array : Array) ? d : new (F ? Uint8Array : Array)(32768);
        2 * this.buffer.length <= this.index && l(Error("invalid index"));
        this.buffer.length <= this.index && this.f();
    }
    H.prototype.f = function () {
        var d = this.buffer, a, c = d.length, e = new (F ? Uint8Array : Array)(c << 1);
        if (F)
            e.set(d);
        else
            for (a = 0; a < c; ++a)
                e[a] = d[a];
        return this.buffer = e;
    };
    H.prototype.d = function (d, a, c) {
        var e = this.buffer, b = this.index, f = this.i, g = e[b], h;
        c && 1 < a && (d = 8 < a ? (N[d & 255] << 24 | N[d >>> 8 & 255] << 16 | N[d >>> 16 & 255] << 8 | N[d >>> 24 & 255]) >> 32 - a : N[d] >> 8 - a);
        if (8 > a + f)
            g = g << a | d, f += a;
        else
            for (h = 0; h < a; ++h)
                g = g << 1 | d >> a - h - 1 & 1, 8 === ++f && (f = 0, e[b++] = N[g], g = 0, b === e.length && (e = this.f()));
        e[b] = g;
        this.buffer = e;
        this.i = f;
        this.index = b;
    };
    H.prototype.finish = function () {
        var d = this.buffer, a = this.index, c;
        0 < this.i && (d[a] <<= 8 - this.i, d[a] = N[d[a]], a++);
        F ? c = d.subarray(0, a) : (d.length = a, c = d);
        return c;
    };
    var fa = new (F ? Uint8Array : Array)(256), O;
    for (O = 0; 256 > O; ++O) {
        for (var P = O, Q = P, ga = 7, P = P >>> 1; P; P >>>= 1)
            Q <<= 1, Q |= P & 1, --ga;
        fa[O] = (Q << ga & 255) >>> 0;
    }
    var N = fa;
    function ha(d) {
        this.buffer = new (F ? Uint16Array : Array)(2 * d);
        this.length = 0;
    }
    ha.prototype.getParent = function (d) {
        return 2 * ((d - 2) / 4 | 0);
    };
    ha.prototype.push = function (d, a) {
        var c, e, b = this.buffer, f;
        c = this.length;
        b[this.length++] = a;
        for (b[this.length++] = d; 0 < c;)
            if (e = this.getParent(c), b[c] > b[e])
                f = b[c], b[c] = b[e], b[e] = f, f = b[c + 1], b[c + 1] = b[e + 1], b[e + 1] = f, c = e;
            else
                break;
        return this.length;
    };
    ha.prototype.pop = function () {
        var d, a, c = this.buffer, e, b, f;
        a = c[0];
        d = c[1];
        this.length -= 2;
        c[0] = c[this.length];
        c[1] = c[this.length + 1];
        for (f = 0;;) {
            b = 2 * f + 2;
            if (b >= this.length)
                break;
            b + 2 < this.length && c[b + 2] > c[b] && (b += 2);
            if (c[b] > c[f])
                e = c[f], c[f] = c[b], c[b] = e, e = c[f + 1], c[f + 1] = c[b + 1], c[b + 1] = e;
            else
                break;
            f = b;
        }
        return {
            index: d,
            value: a,
            length: this.length
        };
    };
    function R(d) {
        var a = d.length, c = 0, e = Number.POSITIVE_INFINITY, b, f, g, h, k, n, q, r, p, m;
        for (r = 0; r < a; ++r)
            d[r] > c && (c = d[r]), d[r] < e && (e = d[r]);
        b = 1 << c;
        f = new (F ? Uint32Array : Array)(b);
        g = 1;
        h = 0;
        for (k = 2; g <= c;) {
            for (r = 0; r < a; ++r)
                if (d[r] === g) {
                    n = 0;
                    q = h;
                    for (p = 0; p < g; ++p)
                        n = n << 1 | q & 1, q >>= 1;
                    m = g << 16 | r;
                    for (p = n; p < b; p += k)
                        f[p] = m;
                    ++h;
                }
            ++g;
            h <<= 1;
            k <<= 1;
        }
        return [f, c, e];
    }
    ;
    function ia(d, a) {
        this.h = ma;
        this.w = 0;
        this.input = F && d instanceof Array ? new Uint8Array(d) : d;
        this.b = 0;
        a && (a.lazy && (this.w = a.lazy), "number" === typeof a.compressionType && (this.h = a.compressionType), a.outputBuffer && (this.a = F && a.outputBuffer instanceof Array ? new Uint8Array(a.outputBuffer) : a.outputBuffer), "number" === typeof a.outputIndex && (this.b = a.outputIndex));
        this.a || (this.a = new (F ? Uint8Array : Array)(32768));
    }
    var ma = 2, na = {
        NONE: 0,
        r: 1,
        k: ma,
        O: 3
    }, oa = [], S;
    for (S = 0; 288 > S; S++)
        switch (x) {
            case 143 >= S:
                oa.push([S + 48, 8]);
                break;
            case 255 >= S:
                oa.push([S - 144 + 400, 9]);
                break;
            case 279 >= S:
                oa.push([S - 256 + 0, 7]);
                break;
            case 287 >= S:
                oa.push([S - 280 + 192, 8]);
                break;
            default:
                l("invalid literal: " + S);
        }
    ia.prototype.j = function () {
        var d, a, c, e, b = this.input;
        switch (this.h) {
            case 0:
                c = 0;
                for (e = b.length; c < e;) {
                    a = F ? b.subarray(c, c + 65535) : b.slice(c, c + 65535);
                    c += a.length;
                    var f = a, g = c === e, h = v, k = v, n = v, q = v, r = v, p = this.a, m = this.b;
                    if (F) {
                        for (p = new Uint8Array(this.a.buffer); p.length <= m + f.length + 5;)
                            p = new Uint8Array(p.length << 1);
                        p.set(this.a);
                    }
                    h = g ? 1 : 0;
                    p[m++] = h | 0;
                    k = f.length;
                    n = ~k + 65536 & 65535;
                    p[m++] = k & 255;
                    p[m++] = k >>> 8 & 255;
                    p[m++] = n & 255;
                    p[m++] = n >>> 8 & 255;
                    if (F)
                        p.set(f, m), m += f.length, p = p.subarray(0, m);
                    else {
                        q = 0;
                        for (r = f.length; q < r; ++q)
                            p[m++] =
                                f[q];
                        p.length = m;
                    }
                    this.b = m;
                    this.a = p;
                }
                break;
            case 1:
                var s = new H(F ? new Uint8Array(this.a.buffer) : this.a, this.b);
                s.d(1, 1, x);
                s.d(1, 2, x);
                var w = pa(this, b), y, ja, A;
                y = 0;
                for (ja = w.length; y < ja; y++)
                    if (A = w[y], H.prototype.d.apply(s, oa[A]), 256 < A)
                        s.d(w[++y], w[++y], x), s.d(w[++y], 5), s.d(w[++y], w[++y], x);
                    else if (256 === A)
                        break;
                this.a = s.finish();
                this.b = this.a.length;
                break;
            case ma:
                var C = new H(F ? new Uint8Array(this.a.buffer) : this.a, this.b), Ea, M, U, V, W, gb = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], ba, Fa, ca, Ga, ka, ra = Array(19), Ha, X, la, z, Ia;
                Ea = ma;
                C.d(1, 1, x);
                C.d(Ea, 2, x);
                M = pa(this, b);
                ba = qa(this.M, 15);
                Fa = sa(ba);
                ca = qa(this.L, 7);
                Ga = sa(ca);
                for (U = 286; 257 < U && 0 === ba[U - 1]; U--)
                    ;
                for (V = 30; 1 < V && 0 === ca[V - 1]; V--)
                    ;
                var Ja = U, Ka = V, I = new (F ? Uint32Array : Array)(Ja + Ka), t, J, u, da, G = new (F ? Uint32Array : Array)(316), E, B, K = new (F ? Uint8Array : Array)(19);
                for (t = J = 0; t < Ja; t++)
                    I[J++] = ba[t];
                for (t = 0; t < Ka; t++)
                    I[J++] = ca[t];
                if (!F) {
                    t = 0;
                    for (da = K.length; t < da; ++t)
                        K[t] = 0;
                }
                t = E = 0;
                for (da = I.length; t < da; t += J) {
                    for (J = 1; t + J < da && I[t + J] === I[t]; ++J)
                        ;
                    u = J;
                    if (0 === I[t])
                        if (3 > u)
                            for (; 0 <
                                u--;)
                                G[E++] = 0, K[0]++;
                        else
                            for (; 0 < u;)
                                B = 138 > u ? u : 138, B > u - 3 && B < u && (B = u - 3), 10 >= B ? (G[E++] = 17, G[E++] = B - 3, K[17]++) : (G[E++] = 18, G[E++] = B - 11, K[18]++), u -= B;
                    else if (G[E++] = I[t], K[I[t]]++, u--, 3 > u)
                        for (; 0 < u--;)
                            G[E++] = I[t], K[I[t]]++;
                    else
                        for (; 0 < u;)
                            B = 6 > u ? u : 6, B > u - 3 && B < u && (B = u - 3), G[E++] = 16, G[E++] = B - 3, K[16]++, u -= B;
                }
                d = F ? G.subarray(0, E) : G.slice(0, E);
                ka = qa(K, 7);
                for (z = 0; 19 > z; z++)
                    ra[z] = ka[gb[z]];
                for (W = 19; 4 < W && 0 === ra[W - 1]; W--)
                    ;
                Ha = sa(ka);
                C.d(U - 257, 5, x);
                C.d(V - 1, 5, x);
                C.d(W - 4, 4, x);
                for (z = 0; z < W; z++)
                    C.d(ra[z], 3, x);
                z = 0;
                for (Ia = d.length; z <
                    Ia; z++)
                    if (X = d[z], C.d(Ha[X], ka[X], x), 16 <= X) {
                        z++;
                        switch (X) {
                            case 16:
                                la = 2;
                                break;
                            case 17:
                                la = 3;
                                break;
                            case 18:
                                la = 7;
                                break;
                            default:
                                l("invalid code: " + X);
                        }
                        C.d(d[z], la, x);
                    }
                var La = [Fa, ba], Ma = [Ga, ca], L, Na, ea, ua, Oa, Pa, Qa, Ra;
                Oa = La[0];
                Pa = La[1];
                Qa = Ma[0];
                Ra = Ma[1];
                L = 0;
                for (Na = M.length; L < Na; ++L)
                    if (ea = M[L], C.d(Oa[ea], Pa[ea], x), 256 < ea)
                        C.d(M[++L], M[++L], x), ua = M[++L], C.d(Qa[ua], Ra[ua], x), C.d(M[++L], M[++L], x);
                    else if (256 === ea)
                        break;
                this.a = C.finish();
                this.b = this.a.length;
                break;
            default:
                l("invalid compression type");
        }
        return this.a;
    };
    function ta(d, a) {
        this.length = d;
        this.H = a;
    }
    var va = function () {
        function d(b) {
            switch (x) {
                case 3 === b:
                    return [257, b - 3, 0];
                case 4 === b:
                    return [258, b - 4, 0];
                case 5 === b:
                    return [259, b - 5, 0];
                case 6 === b:
                    return [260, b - 6, 0];
                case 7 === b:
                    return [261, b - 7, 0];
                case 8 === b:
                    return [262, b - 8, 0];
                case 9 === b:
                    return [263, b - 9, 0];
                case 10 === b:
                    return [264, b - 10, 0];
                case 12 >= b:
                    return [265, b - 11, 1];
                case 14 >= b:
                    return [266, b - 13, 1];
                case 16 >= b:
                    return [267, b - 15, 1];
                case 18 >= b:
                    return [268, b - 17, 1];
                case 22 >= b:
                    return [269, b - 19, 2];
                case 26 >= b:
                    return [270, b - 23, 2];
                case 30 >= b:
                    return [271, b - 27, 2];
                case 34 >= b:
                    return [272,
                        b - 31, 2
                    ];
                case 42 >= b:
                    return [273, b - 35, 3];
                case 50 >= b:
                    return [274, b - 43, 3];
                case 58 >= b:
                    return [275, b - 51, 3];
                case 66 >= b:
                    return [276, b - 59, 3];
                case 82 >= b:
                    return [277, b - 67, 4];
                case 98 >= b:
                    return [278, b - 83, 4];
                case 114 >= b:
                    return [279, b - 99, 4];
                case 130 >= b:
                    return [280, b - 115, 4];
                case 162 >= b:
                    return [281, b - 131, 5];
                case 194 >= b:
                    return [282, b - 163, 5];
                case 226 >= b:
                    return [283, b - 195, 5];
                case 257 >= b:
                    return [284, b - 227, 5];
                case 258 === b:
                    return [285, b - 258, 0];
                default:
                    l("invalid length: " + b);
            }
        }
        var a = [], c, e;
        for (c = 3; 258 >= c; c++)
            e = d(c), a[c] = e[2] << 24 | e[1] <<
                16 | e[0];
        return a;
    }(), wa = F ? new Uint32Array(va) : va;
    function pa(d, a) {
        function c(b, c) {
            var a = b.H, d = [], e = 0, f;
            f = wa[b.length];
            d[e++] = f & 65535;
            d[e++] = f >> 16 & 255;
            d[e++] = f >> 24;
            var g;
            switch (x) {
                case 1 === a:
                    g = [0, a - 1, 0];
                    break;
                case 2 === a:
                    g = [1, a - 2, 0];
                    break;
                case 3 === a:
                    g = [2, a - 3, 0];
                    break;
                case 4 === a:
                    g = [3, a - 4, 0];
                    break;
                case 6 >= a:
                    g = [4, a - 5, 1];
                    break;
                case 8 >= a:
                    g = [5, a - 7, 1];
                    break;
                case 12 >= a:
                    g = [6, a - 9, 2];
                    break;
                case 16 >= a:
                    g = [7, a - 13, 2];
                    break;
                case 24 >= a:
                    g = [8, a - 17, 3];
                    break;
                case 32 >= a:
                    g = [9, a - 25, 3];
                    break;
                case 48 >= a:
                    g = [10, a - 33, 4];
                    break;
                case 64 >= a:
                    g = [11, a - 49, 4];
                    break;
                case 96 >= a:
                    g = [12, a -
                            65, 5
                    ];
                    break;
                case 128 >= a:
                    g = [13, a - 97, 5];
                    break;
                case 192 >= a:
                    g = [14, a - 129, 6];
                    break;
                case 256 >= a:
                    g = [15, a - 193, 6];
                    break;
                case 384 >= a:
                    g = [16, a - 257, 7];
                    break;
                case 512 >= a:
                    g = [17, a - 385, 7];
                    break;
                case 768 >= a:
                    g = [18, a - 513, 8];
                    break;
                case 1024 >= a:
                    g = [19, a - 769, 8];
                    break;
                case 1536 >= a:
                    g = [20, a - 1025, 9];
                    break;
                case 2048 >= a:
                    g = [21, a - 1537, 9];
                    break;
                case 3072 >= a:
                    g = [22, a - 2049, 10];
                    break;
                case 4096 >= a:
                    g = [23, a - 3073, 10];
                    break;
                case 6144 >= a:
                    g = [24, a - 4097, 11];
                    break;
                case 8192 >= a:
                    g = [25, a - 6145, 11];
                    break;
                case 12288 >= a:
                    g = [26, a - 8193, 12];
                    break;
                case 16384 >=
                    a:
                    g = [27, a - 12289, 12];
                    break;
                case 24576 >= a:
                    g = [28, a - 16385, 13];
                    break;
                case 32768 >= a:
                    g = [29, a - 24577, 13];
                    break;
                default:
                    l("invalid distance");
            }
            f = g;
            d[e++] = f[0];
            d[e++] = f[1];
            d[e++] = f[2];
            var h, k;
            h = 0;
            for (k = d.length; h < k; ++h)
                p[m++] = d[h];
            w[d[0]]++;
            y[d[3]]++;
            s = b.length + c - 1;
            r = null;
        }
        var e, b, f, g, h, k = {}, n, q, r, p = F ? new Uint16Array(2 * a.length) : [], m = 0, s = 0, w = new (F ? Uint32Array : Array)(286), y = new (F ? Uint32Array : Array)(30), ja = d.w, A;
        if (!F) {
            for (f = 0; 285 >= f;)
                w[f++] = 0;
            for (f = 0; 29 >= f;)
                y[f++] = 0;
        }
        w[256] = 1;
        e = 0;
        for (b = a.length; e < b; ++e) {
            f = h = 0;
            for (g = 3; f < g && e + f !== b; ++f)
                h = h << 8 | a[e + f];
            k[h] === v && (k[h] = []);
            n = k[h];
            if (!(0 < s--)) {
                for (; 0 < n.length && 32768 < e - n[0];)
                    n.shift();
                if (e + 3 >= b) {
                    r && c(r, -1);
                    f = 0;
                    for (g = b - e; f < g; ++f)
                        A = a[e + f], p[m++] = A, ++w[A];
                    break;
                }
                0 < n.length ? (q = xa(a, e, n), r ? r.length < q.length ? (A = a[e - 1], p[m++] = A, ++w[A], c(q, 0)) : c(r, -1) : q.length < ja ? r = q : c(q, 0)) : r ? c(r, -1) : (A = a[e], p[m++] = A, ++w[A]);
            }
            n.push(e);
        }
        p[m++] = 256;
        w[256]++;
        d.M = w;
        d.L = y;
        return F ? p.subarray(0, m) : p;
    }
    function xa(d, a, c) {
        var e, b, f = 0, g, h, k, n, q = d.length;
        h = 0;
        n = c.length;
        a: for (; h < n; h++) {
            e = c[n - h - 1];
            g = 3;
            if (3 < f) {
                for (k = f; 3 < k; k--)
                    if (d[e + k - 1] !== d[a + k - 1])
                        continue a;
                g = f;
            }
            for (; 258 > g && a + g < q && d[e + g] === d[a + g];)
                ++g;
            g > f && (b = e, f = g);
            if (258 === g)
                break;
        }
        return new ta(f, a - b);
    }
    function qa(d, a) {
        var c = d.length, e = new ha(572), b = new (F ? Uint8Array : Array)(c), f, g, h, k, n;
        if (!F)
            for (k = 0; k < c; k++)
                b[k] = 0;
        for (k = 0; k < c; ++k)
            0 < d[k] && e.push(k, d[k]);
        f = Array(e.length / 2);
        g = new (F ? Uint32Array : Array)(e.length / 2);
        if (1 === f.length)
            return b[e.pop().index] = 1, b;
        k = 0;
        for (n = e.length / 2; k < n; ++k)
            f[k] = e.pop(), g[k] = f[k].value;
        h = ya(g, g.length, a);
        k = 0;
        for (n = f.length; k < n; ++k)
            b[f[k].index] = h[k];
        return b;
    }
    function ya(d, a, c) {
        function e(b) {
            var c = k[b][n[b]];
            c === a ? (e(b + 1), e(b + 1)) : --g[c];
            ++n[b];
        }
        var b = new (F ? Uint16Array : Array)(c), f = new (F ? Uint8Array : Array)(c), g = new (F ? Uint8Array : Array)(a), h = Array(c), k = Array(c), n = Array(c), q = (1 << c) - a, r = 1 << c - 1, p, m, s, w, y;
        b[c - 1] = a;
        for (m = 0; m < c; ++m)
            q < r ? f[m] = 0 : (f[m] = 1, q -= r), q <<= 1, b[c - 2 - m] = (b[c - 1 - m] / 2 | 0) + a;
        b[0] = f[0];
        h[0] = Array(b[0]);
        k[0] = Array(b[0]);
        for (m = 1; m < c; ++m)
            b[m] > 2 * b[m - 1] + f[m] && (b[m] = 2 * b[m - 1] + f[m]), h[m] = Array(b[m]), k[m] = Array(b[m]);
        for (p = 0; p < a; ++p)
            g[p] = c;
        for (s = 0; s < b[c - 1]; ++s)
            h[c -
                1][s] = d[s], k[c - 1][s] = s;
        for (p = 0; p < c; ++p)
            n[p] = 0;
        1 === f[c - 1] && (--g[0], ++n[c - 1]);
        for (m = c - 2; 0 <= m; --m) {
            w = p = 0;
            y = n[m + 1];
            for (s = 0; s < b[m]; s++)
                w = h[m + 1][y] + h[m + 1][y + 1], w > d[p] ? (h[m][s] = w, k[m][s] = a, y += 2) : (h[m][s] = d[p], k[m][s] = p, ++p);
            n[m] = 0;
            1 === f[m] && e(m);
        }
        return g;
    }
    function sa(d) {
        var a = new (F ? Uint16Array : Array)(d.length), c = [], e = [], b = 0, f, g, h, k;
        f = 0;
        for (g = d.length; f < g; f++)
            c[d[f]] = (c[d[f]] | 0) + 1;
        f = 1;
        for (g = 16; f <= g; f++)
            e[f] = b, b += c[f] | 0, b <<= 1;
        f = 0;
        for (g = d.length; f < g; f++) {
            b = e[d[f]];
            e[d[f]] += 1;
            h = a[f] = 0;
            for (k = d[f]; h < k; h++)
                a[f] = a[f] << 1 | b & 1, b >>>= 1;
        }
        return a;
    }
    ;
    function T(d, a) {
        this.l = [];
        this.m = 32768;
        this.e = this.g = this.c = this.q = 0;
        this.input = F ? new Uint8Array(d) : d;
        this.s = !1;
        this.n = za;
        this.C = !1;
        if (a || !(a = {}))
            a.index && (this.c = a.index), a.bufferSize && (this.m = a.bufferSize), a.bufferType && (this.n = a.bufferType), a.resize && (this.C = a.resize);
        switch (this.n) {
            case Aa:
                this.b = 32768;
                this.a = new (F ? Uint8Array : Array)(32768 + this.m + 258);
                break;
            case za:
                this.b = 0;
                this.a = new (F ? Uint8Array : Array)(this.m);
                this.f = this.K;
                this.t = this.I;
                this.o = this.J;
                break;
            default:
                l(Error("invalid inflate mode"));
        }
    }
    var Aa = 0, za = 1, Ba = {
        F: Aa,
        D: za
    };
    T.prototype.p = function () {
        for (; !this.s;) {
            var d = Y(this, 3);
            d & 1 && (this.s = x);
            d >>>= 1;
            switch (d) {
                case 0:
                    var a = this.input, c = this.c, e = this.a, b = this.b, f = a.length, g = v, h = v, k = e.length, n = v;
                    this.e = this.g = 0;
                    c + 1 >= f && l(Error("invalid uncompressed block header: LEN"));
                    g = a[c++] | a[c++] << 8;
                    c + 1 >= f && l(Error("invalid uncompressed block header: NLEN"));
                    h = a[c++] | a[c++] << 8;
                    g === ~h && l(Error("invalid uncompressed block header: length verify"));
                    c + g > a.length && l(Error("input buffer is broken"));
                    switch (this.n) {
                        case Aa:
                            for (; b + g > e.length;) {
                                n =
                                    k - b;
                                g -= n;
                                if (F)
                                    e.set(a.subarray(c, c + n), b), b += n, c += n;
                                else
                                    for (; n--;)
                                        e[b++] = a[c++];
                                this.b = b;
                                e = this.f();
                                b = this.b;
                            }
                            break;
                        case za:
                            for (; b + g > e.length;)
                                e = this.f({
                                    v: 2
                                });
                            break;
                        default:
                            l(Error("invalid inflate mode"));
                    }
                    if (F)
                        e.set(a.subarray(c, c + g), b), b += g, c += g;
                    else
                        for (; g--;)
                            e[b++] = a[c++];
                    this.c = c;
                    this.b = b;
                    this.a = e;
                    break;
                case 1:
                    this.o(Ca, Da);
                    break;
                case 2:
                    Sa(this);
                    break;
                default:
                    l(Error("unknown BTYPE: " + d));
            }
        }
        return this.t();
    };
    var Ta = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], Ua = F ? new Uint16Array(Ta) : Ta, Va = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258], Wa = F ? new Uint16Array(Va) : Va, Xa = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0], Ya = F ? new Uint8Array(Xa) : Xa, Za = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577], $a = F ? new Uint16Array(Za) : Za, ab = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10,
        10, 11, 11, 12, 12, 13, 13
    ], bb = F ? new Uint8Array(ab) : ab, cb = new (F ? Uint8Array : Array)(288), Z, db;
    Z = 0;
    for (db = cb.length; Z < db; ++Z)
        cb[Z] = 143 >= Z ? 8 : 255 >= Z ? 9 : 279 >= Z ? 7 : 8;
    var Ca = R(cb), eb = new (F ? Uint8Array : Array)(30), fb, hb;
    fb = 0;
    for (hb = eb.length; fb < hb; ++fb)
        eb[fb] = 5;
    var Da = R(eb);
    function Y(d, a) {
        for (var c = d.g, e = d.e, b = d.input, f = d.c, g = b.length, h; e < a;)
            f >= g && l(Error("input buffer is broken")), c |= b[f++] << e, e += 8;
        h = c & (1 << a) - 1;
        d.g = c >>> a;
        d.e = e - a;
        d.c = f;
        return h;
    }
    function ib(d, a) {
        for (var c = d.g, e = d.e, b = d.input, f = d.c, g = b.length, h = a[0], k = a[1], n, q; e < k && !(f >= g);)
            c |= b[f++] << e, e += 8;
        n = h[c & (1 << k) - 1];
        q = n >>> 16;
        d.g = c >> q;
        d.e = e - q;
        d.c = f;
        return n & 65535;
    }
    function Sa(d) {
        function a(a, b, c) {
            var d, e = this.z, f, g;
            for (g = 0; g < a;)
                switch (d = ib(this, b), d) {
                    case 16:
                        for (f = 3 + Y(this, 2); f--;)
                            c[g++] = e;
                        break;
                    case 17:
                        for (f = 3 + Y(this, 3); f--;)
                            c[g++] = 0;
                        e = 0;
                        break;
                    case 18:
                        for (f = 11 + Y(this, 7); f--;)
                            c[g++] = 0;
                        e = 0;
                        break;
                    default:
                        e = c[g++] = d;
                }
            this.z = e;
            return c;
        }
        var c = Y(d, 5) + 257, e = Y(d, 5) + 1, b = Y(d, 4) + 4, f = new (F ? Uint8Array : Array)(Ua.length), g, h, k, n;
        for (n = 0; n < b; ++n)
            f[Ua[n]] = Y(d, 3);
        if (!F) {
            n = b;
            for (b = f.length; n < b; ++n)
                f[Ua[n]] = 0;
        }
        g = R(f);
        h = new (F ? Uint8Array : Array)(c);
        k = new (F ? Uint8Array : Array)(e);
        d.z = 0;
        d.o(R(a.call(d, c, g, h)), R(a.call(d, e, g, k)));
    }
    T.prototype.o = function (d, a) {
        var c = this.a, e = this.b;
        this.u = d;
        for (var b = c.length - 258, f, g, h, k; 256 !== (f = ib(this, d));)
            if (256 > f)
                e >= b && (this.b = e, c = this.f(), e = this.b), c[e++] = f;
            else {
                g = f - 257;
                k = Wa[g];
                0 < Ya[g] && (k += Y(this, Ya[g]));
                f = ib(this, a);
                h = $a[f];
                0 < bb[f] && (h += Y(this, bb[f]));
                e >= b && (this.b = e, c = this.f(), e = this.b);
                for (; k--;)
                    c[e] = c[e++ - h];
            }
        for (; 8 <= this.e;)
            this.e -= 8, this.c--;
        this.b = e;
    };
    T.prototype.J = function (d, a) {
        var c = this.a, e = this.b;
        this.u = d;
        for (var b = c.length, f, g, h, k; 256 !== (f = ib(this, d));)
            if (256 > f)
                e >= b && (c = this.f(), b = c.length), c[e++] = f;
            else {
                g = f - 257;
                k = Wa[g];
                0 < Ya[g] && (k += Y(this, Ya[g]));
                f = ib(this, a);
                h = $a[f];
                0 < bb[f] && (h += Y(this, bb[f]));
                e + k > b && (c = this.f(), b = c.length);
                for (; k--;)
                    c[e] = c[e++ - h];
            }
        for (; 8 <= this.e;)
            this.e -= 8, this.c--;
        this.b = e;
    };
    T.prototype.f = function () {
        var d = new (F ? Uint8Array : Array)(this.b - 32768), a = this.b - 32768, c, e, b = this.a;
        if (F)
            d.set(b.subarray(32768, d.length));
        else {
            c = 0;
            for (e = d.length; c < e; ++c)
                d[c] = b[c + 32768];
        }
        this.l.push(d);
        this.q += d.length;
        if (F)
            b.set(b.subarray(a, a + 32768));
        else
            for (c = 0; 32768 > c; ++c)
                b[c] = b[a + c];
        this.b = 32768;
        return b;
    };
    T.prototype.K = function (d) {
        var a, c = this.input.length / this.c + 1 | 0, e, b, f, g = this.input, h = this.a;
        d && ("number" === typeof d.v && (c = d.v), "number" === typeof d.G && (c += d.G));
        2 > c ? (e = (g.length - this.c) / this.u[2], f = 258 * (e / 2) | 0, b = f < h.length ? h.length + f : h.length << 1) : b = h.length * c;
        F ? (a = new Uint8Array(b), a.set(h)) : a = h;
        return this.a = a;
    };
    T.prototype.t = function () {
        var d = 0, a = this.a, c = this.l, e, b = new (F ? Uint8Array : Array)(this.q + (this.b - 32768)), f, g, h, k;
        if (0 === c.length)
            return F ? this.a.subarray(32768, this.b) : this.a.slice(32768, this.b);
        f = 0;
        for (g = c.length; f < g; ++f) {
            e = c[f];
            h = 0;
            for (k = e.length; h < k; ++h)
                b[d++] = e[h];
        }
        f = 32768;
        for (g = this.b; f < g; ++f)
            b[d++] = a[f];
        this.l = [];
        return this.buffer = b;
    };
    T.prototype.I = function () {
        var d, a = this.b;
        F ? this.C ? (d = new Uint8Array(a), d.set(this.a.subarray(0, a))) : d = this.a.subarray(0, a) : (this.a.length > a && (this.a.length = a), d = this.a);
        return this.buffer = d;
    };
    function jb(d) {
        if ("string" === typeof d) {
            var a = d.split(""), c, e;
            c = 0;
            for (e = a.length; c < e; c++)
                a[c] = (a[c].charCodeAt(0) & 255) >>> 0;
            d = a;
        }
        for (var b = 1, f = 0, g = d.length, h, k = 0; 0 < g;) {
            h = 1024 < g ? 1024 : g;
            g -= h;
            do
                b += d[k++], f += b;
            while (--h);
            b %= 65521;
            f %= 65521;
        }
        return (f << 16 | b) >>> 0;
    }
    ;
    function kb(d, a) {
        var c, e;
        this.input = d;
        this.c = 0;
        if (a || !(a = {}))
            a.index && (this.c = a.index), a.verify && (this.N = a.verify);
        c = d[this.c++];
        e = d[this.c++];
        switch (c & 15) {
            case lb:
                this.method = lb;
                break;
            default:
                l(Error("unsupported compression method"));
        }
        0 !== ((c << 8) + e) % 31 && l(Error("invalid fcheck flag:" + ((c << 8) + e) % 31));
        e & 32 && l(Error("fdict flag is not supported"));
        this.B = new T(d, {
            index: this.c,
            bufferSize: a.bufferSize,
            bufferType: a.bufferType,
            resize: a.resize
        });
    }
    kb.prototype.p = function () {
        var d = this.input, a, c;
        a = this.B.p();
        this.c = this.B.c;
        this.N && (c = (d[this.c++] << 24 | d[this.c++] << 16 | d[this.c++] << 8 | d[this.c++]) >>> 0, c !== jb(a) && l(Error("invalid adler-32 checksum")));
        return a;
    };
    var lb = 8;
    function mb(d, a) {
        this.input = d;
        this.a = new (F ? Uint8Array : Array)(32768);
        this.h = $.k;
        var c = {}, e;
        if ((a || !(a = {})) && "number" === typeof a.compressionType)
            this.h = a.compressionType;
        for (e in a)
            c[e] = a[e];
        c.outputBuffer = this.a;
        this.A = new ia(this.input, c);
    }
    var $ = na;
    mb.prototype.j = function () {
        var d, a, c, e, b, f, g, h = 0;
        g = this.a;
        d = lb;
        switch (d) {
            case lb:
                a = Math.LOG2E * Math.log(32768) - 8;
                break;
            default:
                l(Error("invalid compression method"));
        }
        c = a << 4 | d;
        g[h++] = c;
        switch (d) {
            case lb:
                switch (this.h) {
                    case $.NONE:
                        b = 0;
                        break;
                    case $.r:
                        b = 1;
                        break;
                    case $.k:
                        b = 2;
                        break;
                    default:
                        l(Error("unsupported compression type"));
                }
                break;
            default:
                l(Error("invalid compression method"));
        }
        e = b << 6 | 0;
        g[h++] = e | 31 - (256 * c + e) % 31;
        f = jb(this.input);
        this.A.b = h;
        g = this.A.j();
        h = g.length;
        F && (g = new Uint8Array(g.buffer), g.length <=
            h + 4 && (this.a = new Uint8Array(g.length + 4), this.a.set(g), g = this.a), g = g.subarray(0, h + 4));
        g[h++] = f >> 24 & 255;
        g[h++] = f >> 16 & 255;
        g[h++] = f >> 8 & 255;
        g[h++] = f & 255;
        return g;
    };
    function nb(d, a) {
        var c, e, b, f;
        if (Object.keys)
            c = Object.keys(a);
        else
            for (e in c = [], b = 0, a)
                c[b++] = e;
        b = 0;
        for (f = c.length; b < f; ++b)
            e = c[b], D(d + "." + e, a[e]);
    }
    ;
    D("Zlib.Inflate", kb);
    D("Zlib.Inflate.prototype.decompress", kb.prototype.p);
    nb("Zlib.Inflate.BufferType", {
        ADAPTIVE: Ba.D,
        BLOCK: Ba.F
    });
    D("Zlib.Deflate", mb);
    D("Zlib.Deflate.compress", function (d, a) {
        return (new mb(d, a)).j();
    });
    D("Zlib.Deflate.prototype.compress", mb.prototype.j);
    nb("Zlib.Deflate.CompressionType", {
        NONE: $.NONE,
        FIXED: $.r,
        DYNAMIC: $.k
    });
}).call(this); //@ sourceMappingURL=zlib.min.js.map
var decoder;
(function (decoder) {
    /**
     * The Endian class contains values that denote the byte order used to represent multibyte numbers.
     * The byte order is either bigEndian (most significant byte first) or littleEndian (least significant byte first).
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * Endian 类中包含一些值，它们表示用于表示多字节数字的字节顺序。
     * 字节顺序为 bigEndian（最高有效字节位于最前）或 littleEndian（最低有效字节位于最前）。
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    var Endian = (function () {
        function Endian() {
        }
        /**
         * Indicates the least significant byte of the multibyte number appears first in the sequence of bytes.
         * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits per byte). The most significant byte is 0x12. The least significant byte is 0x78. (For the equivalent decimal number, 305419896, the most significant digit is 3, and the least significant digit is 6).
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 表示多字节数字的最低有效字节位于字节序列的最前面。
         * 十六进制数字 0x12345678 包含 4 个字节（每个字节包含 2 个十六进制数字）。最高有效字节为 0x12。最低有效字节为 0x78。（对于等效的十进制数字 305419896，最高有效数字是 3，最低有效数字是 6）。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        Endian.LITTLE_ENDIAN = "littleEndian";
        /**
         * Indicates the most significant byte of the multibyte number appears first in the sequence of bytes.
         * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits per byte).  The most significant byte is 0x12. The least significant byte is 0x78. (For the equivalent decimal number, 305419896, the most significant digit is 3, and the least significant digit is 6).
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 表示多字节数字的最高有效字节位于字节序列的最前面。
         * 十六进制数字 0x12345678 包含 4 个字节（每个字节包含 2 个十六进制数字）。最高有效字节为 0x12。最低有效字节为 0x78。（对于等效的十进制数字 305419896，最高有效数字是 3，最低有效数字是 6）。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        Endian.BIG_ENDIAN = "bigEndian";
        return Endian;
    }());
    decoder.Endian = Endian;
    __reflect(Endian.prototype, "decoder.Endian");
    /**
     * The ByteArray class provides methods and attributes for optimized reading and writing as well as dealing with binary data.
     * Note: The ByteArray class is applied to the advanced developers who need to access data at the byte layer.
     * @version Egret 2.4
     * @platform Web,Native
     * @includeExample egret/utils/ByteArray.ts
     * @language en_US
     */
    /**
     * ByteArray 类提供用于优化读取、写入以及处理二进制数据的方法和属性。
     * 注意：ByteArray 类适用于需要在字节层访问数据的高级开发人员。
     * @version Egret 2.4
     * @platform Web,Native
     * @includeExample egret/utils/ByteArray.ts
     * @language zh_CN
     */
    var ByteArray = (function () {
        /**
         * @version Egret 2.4
         * @platform Web,Native
         */
        function ByteArray(buffer, bufferExtSize) {
            if (bufferExtSize === void 0) { bufferExtSize = 0; }
            /**
             * @private
             */
            this.bufferExtSize = 0; //Buffer expansion size
            /**
             * @private
             */
            this.EOF_byte = -1;
            /**
             * @private
             */
            this.EOF_code_point = -1;
            if (bufferExtSize < 0) {
                bufferExtSize = 0;
            }
            this.bufferExtSize = bufferExtSize;
            var bytes, wpos = 0;
            if (buffer) {
                var uint8 = void 0;
                if (buffer instanceof Uint8Array) {
                    uint8 = buffer;
                    wpos = buffer.length;
                }
                else {
                    wpos = buffer.byteLength;
                    uint8 = new Uint8Array(buffer);
                }
                if (bufferExtSize == 0) {
                    bytes = new Uint8Array(wpos);
                }
                else {
                    var multi = (wpos / bufferExtSize | 0) + 1;
                    bytes = new Uint8Array(multi * bufferExtSize);
                }
                bytes.set(uint8);
            }
            else {
                bytes = new Uint8Array(bufferExtSize);
            }
            this.write_position = wpos;
            this._position = 0;
            this._bytes = bytes;
            this.data = new DataView(bytes.buffer);
            this.endian = Endian.BIG_ENDIAN;
        }
        Object.defineProperty(ByteArray.prototype, "endian", {
            /**
             * Changes or reads the byte order; egret.EndianConst.BIG_ENDIAN or egret.EndianConst.LITTLE_EndianConst.
             * @default egret.EndianConst.BIG_ENDIAN
             * @version Egret 2.4
             * @platform Web,Native
             * @language en_US
             */
            /**
             * 更改或读取数据的字节顺序；egret.EndianConst.BIG_ENDIAN 或 egret.EndianConst.LITTLE_ENDIAN。
             * @default egret.EndianConst.BIG_ENDIAN
             * @version Egret 2.4
             * @platform Web,Native
             * @language zh_CN
             */
            get: function () {
                return this.$endian == 0 /* LITTLE_ENDIAN */ ? Endian.LITTLE_ENDIAN : Endian.BIG_ENDIAN;
            },
            set: function (value) {
                this.$endian = value == Endian.LITTLE_ENDIAN ? 0 /* LITTLE_ENDIAN */ : 1 /* BIG_ENDIAN */;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @deprecated
         * @version Egret 2.4
         * @platform Web,Native
         */
        ByteArray.prototype.setArrayBuffer = function (buffer) {
        };
        Object.defineProperty(ByteArray.prototype, "readAvailable", {
            /**
             * 可读的剩余字节数
             *
             * @returns
             *
             * @memberOf ByteArray
             */
            get: function () {
                return this.write_position - this._position;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "buffer", {
            get: function () {
                return this.data.buffer.slice(0, this.write_position);
            },
            /**
             * @private
             */
            set: function (value) {
                var wpos = value.byteLength;
                var uint8 = new Uint8Array(value);
                var bufferExtSize = this.bufferExtSize;
                var bytes;
                if (bufferExtSize == 0) {
                    bytes = new Uint8Array(wpos);
                }
                else {
                    var multi = (wpos / bufferExtSize | 0) + 1;
                    bytes = new Uint8Array(multi * bufferExtSize);
                }
                bytes.set(uint8);
                this.write_position = wpos;
                this._bytes = bytes;
                this.data = new DataView(bytes.buffer);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "rawBuffer", {
            get: function () {
                return this.data.buffer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "bytes", {
            get: function () {
                return this._bytes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "dataView", {
            /**
             * @private
             * @version Egret 2.4
             * @platform Web,Native
             */
            get: function () {
                return this.data;
            },
            /**
             * @private
             */
            set: function (value) {
                this.buffer = value.buffer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "bufferOffset", {
            /**
             * @private
             */
            get: function () {
                return this.data.byteOffset;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "position", {
            /**
             * The current position of the file pointer (in bytes) to move or return to the ByteArray object. The next time you start reading reading method call in this position, or will start writing in this position next time call a write method.
             * @version Egret 2.4
             * @platform Web,Native
             * @language en_US
             */
            /**
             * 将文件指针的当前位置（以字节为单位）移动或返回到 ByteArray 对象中。下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
             * @version Egret 2.4
             * @platform Web,Native
             * @language zh_CN
             */
            get: function () {
                return this._position;
            },
            set: function (value) {
                this._position = value;
                if (value > this.write_position) {
                    this.write_position = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "length", {
            /**
             * The length of the ByteArray object (in bytes).
                      * If the length is set to be larger than the current length, the right-side zero padding byte array.
                      * If the length is set smaller than the current length, the byte array is truncated.
             * @version Egret 2.4
             * @platform Web,Native
             * @language en_US
             */
            /**
             * ByteArray 对象的长度（以字节为单位）。
             * 如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧。
             * 如果将长度设置为小于当前长度的值，将会截断该字节数组。
             * @version Egret 2.4
             * @platform Web,Native
             * @language zh_CN
             */
            get: function () {
                return this.write_position;
            },
            set: function (value) {
                this.write_position = value;
                if (this.data.byteLength > value) {
                    this._position = value;
                }
                this._validateBuffer(value);
            },
            enumerable: true,
            configurable: true
        });
        ByteArray.prototype._validateBuffer = function (value) {
            if (this.data.byteLength < value) {
                var be = this.bufferExtSize;
                var tmp = void 0;
                if (be == 0) {
                    tmp = new Uint8Array(value);
                }
                else {
                    var nLen = ((value / be >> 0) + 1) * be;
                    tmp = new Uint8Array(nLen);
                }
                tmp.set(this._bytes);
                this._bytes = tmp;
                this.data = new DataView(tmp.buffer);
            }
        };
        Object.defineProperty(ByteArray.prototype, "bytesAvailable", {
            /**
             * The number of bytes that can be read from the current position of the byte array to the end of the array data.
             * When you access a ByteArray object, the bytesAvailable property in conjunction with the read methods each use to make sure you are reading valid data.
             * @version Egret 2.4
             * @platform Web,Native
             * @language en_US
             */
            /**
             * 可从字节数组的当前位置到数组末尾读取的数据的字节数。
             * 每次访问 ByteArray 对象时，将 bytesAvailable 属性与读取方法结合使用，以确保读取有效的数据。
             * @version Egret 2.4
             * @platform Web,Native
             * @language zh_CN
             */
            get: function () {
                return this.data.byteLength - this._position;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Clears the contents of the byte array and resets the length and position properties to 0.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 清除字节数组的内容，并将 length 和 position 属性重置为 0。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.clear = function () {
            var buffer = new ArrayBuffer(this.bufferExtSize);
            this.data = new DataView(buffer);
            this._bytes = new Uint8Array(buffer);
            this._position = 0;
            this.write_position = 0;
        };
        /**
         * Read a Boolean value from the byte stream. Read a simple byte. If the byte is non-zero, it returns true; otherwise, it returns false.
         * @return If the byte is non-zero, it returns true; otherwise, it returns false.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取布尔值。读取单个字节，如果字节非零，则返回 true，否则返回 false
         * @return 如果字节不为零，则返回 true，否则返回 false
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readBoolean = function () {
            if (this.validate(1 /* SIZE_OF_BOOLEAN */))
                return !!this._bytes[this.position++];
        };
        /**
         * Read signed bytes from the byte stream.
         * @return An integer ranging from -128 to 127
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取带符号的字节
         * @return 介于 -128 和 127 之间的整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readByte = function () {
            if (this.validate(1 /* SIZE_OF_INT8 */))
                return this.data.getInt8(this.position++);
        };
        /**
         * Read data byte number specified by the length parameter from the byte stream. Starting from the position specified by offset, read bytes into the ByteArray object specified by the bytes parameter, and write bytes into the target ByteArray
         * @param bytes ByteArray object that data is read into
         * @param offset Offset (position) in bytes. Read data should be written from this position
         * @param length Byte number to be read Default value 0 indicates reading all available data
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取 length 参数指定的数据字节数。从 offset 指定的位置开始，将字节读入 bytes 参数指定的 ByteArray 对象中，并将字节写入目标 ByteArray 中
         * @param bytes 要将数据读入的 ByteArray 对象
         * @param offset bytes 中的偏移（位置），应从该位置写入读取的数据
         * @param length 要读取的字节数。默认值 0 导致读取所有可用的数据
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readBytes = function (bytes, offset, length) {
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 0; }
            if (!bytes) {
                return;
            }
            var pos = this._position;
            var available = this.write_position - pos;
            if (available < 0) {
                console.error(1025);
                return;
            }
            if (length == 0) {
                length = available;
            }
            else if (length > available) {
                console.error(1025);
                return;
            }
            bytes.validateBuffer(offset + length);
            bytes._bytes.set(this._bytes.subarray(pos, pos + length), offset);
            this.position += length;
        };
        /**
         * Read an IEEE 754 double-precision (64 bit) floating point number from the byte stream
         * @return Double-precision (64 bit) floating point number
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个 IEEE 754 双精度（64 位）浮点数
         * @return 双精度（64 位）浮点数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readDouble = function () {
            if (this.validate(8 /* SIZE_OF_FLOAT64 */)) {
                var value = this.data.getFloat64(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
                this.position += 8 /* SIZE_OF_FLOAT64 */;
                return value;
            }
        };
        /**
         * Read an IEEE 754 single-precision (32 bit) floating point number from the byte stream
         * @return Single-precision (32 bit) floating point number
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个 IEEE 754 单精度（32 位）浮点数
         * @return 单精度（32 位）浮点数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readFloat = function () {
            if (this.validate(4 /* SIZE_OF_FLOAT32 */)) {
                var value = this.data.getFloat32(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
                this.position += 4 /* SIZE_OF_FLOAT32 */;
                return value;
            }
        };
        /**
         * Read a 32-bit signed integer from the byte stream.
         * @return A 32-bit signed integer ranging from -2147483648 to 2147483647
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个带符号的 32 位整数
         * @return 介于 -2147483648 和 2147483647 之间的 32 位带符号整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readInt = function () {
            if (this.validate(4 /* SIZE_OF_INT32 */)) {
                var value = this.data.getInt32(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
                this.position += 4 /* SIZE_OF_INT32 */;
                return value;
            }
        };
        /**
         * Read a 16-bit signed integer from the byte stream.
         * @return A 16-bit signed integer ranging from -32768 to 32767
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个带符号的 16 位整数
         * @return 介于 -32768 和 32767 之间的 16 位带符号整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readShort = function () {
            if (this.validate(2 /* SIZE_OF_INT16 */)) {
                var value = this.data.getInt16(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
                this.position += 2 /* SIZE_OF_INT16 */;
                return value;
            }
        };
        /**
         * Read unsigned bytes from the byte stream.
         * @return A 32-bit unsigned integer ranging from 0 to 255
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取无符号的字节
         * @return 介于 0 和 255 之间的 32 位无符号整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readUnsignedByte = function () {
            if (this.validate(1 /* SIZE_OF_UINT8 */))
                return this._bytes[this.position++];
        };
        /**
         * Read a 32-bit unsigned integer from the byte stream.
         * @return A 32-bit unsigned integer ranging from 0 to 4294967295
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个无符号的 32 位整数
         * @return 介于 0 和 4294967295 之间的 32 位无符号整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readUnsignedInt = function () {
            if (this.validate(4 /* SIZE_OF_UINT32 */)) {
                var value = this.data.getUint32(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
                this.position += 4 /* SIZE_OF_UINT32 */;
                return value;
            }
        };
        /**
         * Read a 16-bit unsigned integer from the byte stream.
         * @return A 16-bit unsigned integer ranging from 0 to 65535
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个无符号的 16 位整数
         * @return 介于 0 和 65535 之间的 16 位无符号整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readUnsignedShort = function () {
            if (this.validate(2 /* SIZE_OF_UINT16 */)) {
                var value = this.data.getUint16(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
                this.position += 2 /* SIZE_OF_UINT16 */;
                return value;
            }
        };
        /**
         * Read a UTF-8 character string from the byte stream Assume that the prefix of the character string is a short unsigned integer (use byte to express length)
         * @return UTF-8 character string
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个 UTF-8 字符串。假定字符串的前缀是无符号的短整型（以字节表示长度）
         * @return UTF-8 编码的字符串
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readUTF = function () {
            var length = this.readUnsignedShort();
            if (length > 0) {
                return this.readUTFBytes(length);
            }
            else {
                return "";
            }
        };
        /**
         * Read a UTF-8 byte sequence specified by the length parameter from the byte stream, and then return a character string
         * @param Specify a short unsigned integer of the UTF-8 byte length
         * @return A character string consists of UTF-8 bytes of the specified length
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个由 length 参数指定的 UTF-8 字节序列，并返回一个字符串
         * @param length 指明 UTF-8 字节长度的无符号短整型数
         * @return 由指定长度的 UTF-8 字节组成的字符串
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readUTFBytes = function (length) {
            if (!this.validate(length)) {
                return;
            }
            var data = this.data;
            var bytes = new Uint8Array(data.buffer, data.byteOffset + this._position, length);
            this.position += length;
            return this.decodeUTF8(bytes);
        };
        /**
         * Write a Boolean value. A single byte is written according to the value parameter. If the value is true, write 1; if the value is false, write 0.
         * @param value A Boolean value determining which byte is written. If the value is true, write 1; if the value is false, write 0.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 写入布尔值。根据 value 参数写入单个字节。如果为 true，则写入 1，如果为 false，则写入 0
         * @param value 确定写入哪个字节的布尔值。如果该参数为 true，则该方法写入 1；如果该参数为 false，则该方法写入 0
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeBoolean = function (value) {
            this.validateBuffer(1 /* SIZE_OF_BOOLEAN */);
            this._bytes[this.position++] = +value;
        };
        /**
         * Write a byte into the byte stream
         * The low 8 bits of the parameter are used. The high 24 bits are ignored.
         * @param value A 32-bit integer. The low 8 bits will be written into the byte stream
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个字节
         * 使用参数的低 8 位。忽略高 24 位
         * @param value 一个 32 位整数。低 8 位将被写入字节流
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeByte = function (value) {
            this.validateBuffer(1 /* SIZE_OF_INT8 */);
            this._bytes[this.position++] = value & 0xff;
        };
        /**
         * Write the byte sequence that includes length bytes in the specified byte array, bytes, (starting at the byte specified by offset, using a zero-based index), into the byte stream
         * If the length parameter is omitted, the default length value 0 is used and the entire buffer starting at offset is written. If the offset parameter is also omitted, the entire buffer is written
         * If the offset or length parameter is out of range, they are clamped to the beginning and end of the bytes array.
         * @param bytes ByteArray Object
         * @param offset A zero-based index specifying the position into the array to begin writing
         * @param length An unsigned integer specifying how far into the buffer to write
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 将指定字节数组 bytes（起始偏移量为 offset，从零开始的索引）中包含 length 个字节的字节序列写入字节流
         * 如果省略 length 参数，则使用默认长度 0；该方法将从 offset 开始写入整个缓冲区。如果还省略了 offset 参数，则写入整个缓冲区
         * 如果 offset 或 length 超出范围，它们将被锁定到 bytes 数组的开头和结尾
         * @param bytes ByteArray 对象
         * @param offset 从 0 开始的索引，表示在数组中开始写入的位置
         * @param length 一个无符号整数，表示在缓冲区中的写入范围
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeBytes = function (bytes, offset, length) {
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 0; }
            var writeLength;
            if (offset < 0) {
                return;
            }
            if (length < 0) {
                return;
            }
            else if (length == 0) {
                writeLength = bytes.length - offset;
            }
            else {
                writeLength = Math.min(bytes.length - offset, length);
            }
            if (writeLength > 0) {
                this.validateBuffer(writeLength);
                this._bytes.set(bytes._bytes.subarray(offset, offset + writeLength), this._position);
                this.position = this._position + writeLength;
            }
        };
        /**
         * Write an IEEE 754 double-precision (64 bit) floating point number into the byte stream
         * @param value Double-precision (64 bit) floating point number
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个 IEEE 754 双精度（64 位）浮点数
         * @param value 双精度（64 位）浮点数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeDouble = function (value) {
            this.validateBuffer(8 /* SIZE_OF_FLOAT64 */);
            this.data.setFloat64(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 8 /* SIZE_OF_FLOAT64 */;
        };
        /**
         * Write an IEEE 754 single-precision (32 bit) floating point number into the byte stream
         * @param value Single-precision (32 bit) floating point number
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个 IEEE 754 单精度（32 位）浮点数
         * @param value 单精度（32 位）浮点数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeFloat = function (value) {
            this.validateBuffer(4 /* SIZE_OF_FLOAT32 */);
            this.data.setFloat32(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_FLOAT32 */;
        };
        /**
         * Write a 32-bit signed integer into the byte stream
         * @param value An integer to be written into the byte stream
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个带符号的 32 位整数
         * @param value 要写入字节流的整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeInt = function (value) {
            this.validateBuffer(4 /* SIZE_OF_INT32 */);
            this.data.setInt32(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_INT32 */;
        };
        /**
         * Write a 16-bit integer into the byte stream. The low 16 bits of the parameter are used. The high 16 bits are ignored.
         * @param value A 32-bit integer. Its low 16 bits will be written into the byte stream
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个 16 位整数。使用参数的低 16 位。忽略高 16 位
         * @param value 32 位整数，该整数的低 16 位将被写入字节流
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeShort = function (value) {
            this.validateBuffer(2 /* SIZE_OF_INT16 */);
            this.data.setInt16(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 2 /* SIZE_OF_INT16 */;
        };
        /**
         * Write a 32-bit unsigned integer into the byte stream
         * @param value An unsigned integer to be written into the byte stream
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个无符号的 32 位整数
         * @param value 要写入字节流的无符号整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeUnsignedInt = function (value) {
            this.validateBuffer(4 /* SIZE_OF_UINT32 */);
            this.data.setUint32(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_UINT32 */;
        };
        /**
         * Write a 16-bit unsigned integer into the byte stream
         * @param value An unsigned integer to be written into the byte stream
         * @version Egret 2.5
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个无符号的 16 位整数
         * @param value 要写入字节流的无符号整数
         * @version Egret 2.5
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeUnsignedShort = function (value) {
            this.validateBuffer(2 /* SIZE_OF_UINT16 */);
            this.data.setUint16(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 2 /* SIZE_OF_UINT16 */;
        };
        /**
         * Write a UTF-8 string into the byte stream. The length of the UTF-8 string in bytes is written first, as a 16-bit integer, followed by the bytes representing the characters of the string
         * @param value Character string value to be written
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节
         * @param value 要写入的字符串值
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeUTF = function (value) {
            var utf8bytes = this.encodeUTF8(value);
            var length = utf8bytes.length;
            this.validateBuffer(2 /* SIZE_OF_UINT16 */ + length);
            this.data.setUint16(this._position, length, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 2 /* SIZE_OF_UINT16 */;
            this._writeUint8Array(utf8bytes, false);
        };
        /**
         * Write a UTF-8 string into the byte stream. Similar to the writeUTF() method, but the writeUTFBytes() method does not prefix the string with a 16-bit length word
         * @param value Character string value to be written
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 将 UTF-8 字符串写入字节流。类似于 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位长度的词为字符串添加前缀
         * @param value 要写入的字符串值
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeUTFBytes = function (value) {
            this._writeUint8Array(this.encodeUTF8(value));
        };
        /**
         *
         * @returns
         * @version Egret 2.4
         * @platform Web,Native
         */
        ByteArray.prototype.toString = function () {
            return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
        };
        /**
         * @private
         * 将 Uint8Array 写入字节流
         * @param bytes 要写入的Uint8Array
         * @param validateBuffer
         */
        ByteArray.prototype._writeUint8Array = function (bytes, validateBuffer) {
            if (validateBuffer === void 0) { validateBuffer = true; }
            var pos = this._position;
            var npos = pos + bytes.length;
            if (validateBuffer) {
                this.validateBuffer(npos);
            }
            this.bytes.set(bytes, pos);
            this.position = npos;
        };
        /**
         * @param len
         * @returns
         * @version Egret 2.4
         * @platform Web,Native
         * @private
         */
        ByteArray.prototype.validate = function (len) {
            var bl = this._bytes.length;
            if (bl > 0 && this._position + len <= bl) {
                return true;
            }
            else {
                console.error(1025);
            }
        };
        /**********************/
        /*  PRIVATE METHODS   */
        /**********************/
        /**
         * @private
         * @param len
         * @param needReplace
         */
        ByteArray.prototype.validateBuffer = function (len) {
            this.write_position = len > this.write_position ? len : this.write_position;
            len += this._position;
            this._validateBuffer(len);
        };
        /**
         * @private
         * UTF-8 Encoding/Decoding
         */
        ByteArray.prototype.encodeUTF8 = function (str) {
            var pos = 0;
            var codePoints = this.stringToCodePoints(str);
            var outputBytes = [];
            while (codePoints.length > pos) {
                var code_point = codePoints[pos++];
                if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                    this.encoderError(code_point);
                }
                else if (this.inRange(code_point, 0x0000, 0x007f)) {
                    outputBytes.push(code_point);
                }
                else {
                    var count = void 0, offset = void 0;
                    if (this.inRange(code_point, 0x0080, 0x07FF)) {
                        count = 1;
                        offset = 0xC0;
                    }
                    else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                        count = 2;
                        offset = 0xE0;
                    }
                    else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                        count = 3;
                        offset = 0xF0;
                    }
                    outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                    while (count > 0) {
                        var temp = this.div(code_point, Math.pow(64, count - 1));
                        outputBytes.push(0x80 + (temp % 64));
                        count -= 1;
                    }
                }
            }
            return new Uint8Array(outputBytes);
        };
        /**
         * @private
         *
         * @param data
         * @returns
         */
        ByteArray.prototype.decodeUTF8 = function (data) {
            var fatal = false;
            var pos = 0;
            var result = "";
            var code_point;
            var utf8_code_point = 0;
            var utf8_bytes_needed = 0;
            var utf8_bytes_seen = 0;
            var utf8_lower_boundary = 0;
            while (data.length > pos) {
                var _byte = data[pos++];
                if (_byte == this.EOF_byte) {
                    if (utf8_bytes_needed != 0) {
                        code_point = this.decoderError(fatal);
                    }
                    else {
                        code_point = this.EOF_code_point;
                    }
                }
                else {
                    if (utf8_bytes_needed == 0) {
                        if (this.inRange(_byte, 0x00, 0x7F)) {
                            code_point = _byte;
                        }
                        else {
                            if (this.inRange(_byte, 0xC2, 0xDF)) {
                                utf8_bytes_needed = 1;
                                utf8_lower_boundary = 0x80;
                                utf8_code_point = _byte - 0xC0;
                            }
                            else if (this.inRange(_byte, 0xE0, 0xEF)) {
                                utf8_bytes_needed = 2;
                                utf8_lower_boundary = 0x800;
                                utf8_code_point = _byte - 0xE0;
                            }
                            else if (this.inRange(_byte, 0xF0, 0xF4)) {
                                utf8_bytes_needed = 3;
                                utf8_lower_boundary = 0x10000;
                                utf8_code_point = _byte - 0xF0;
                            }
                            else {
                                this.decoderError(fatal);
                            }
                            utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                            code_point = null;
                        }
                    }
                    else if (!this.inRange(_byte, 0x80, 0xBF)) {
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        pos--;
                        code_point = this.decoderError(fatal, _byte);
                    }
                    else {
                        utf8_bytes_seen += 1;
                        utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                        if (utf8_bytes_seen !== utf8_bytes_needed) {
                            code_point = null;
                        }
                        else {
                            var cp = utf8_code_point;
                            var lower_boundary = utf8_lower_boundary;
                            utf8_code_point = 0;
                            utf8_bytes_needed = 0;
                            utf8_bytes_seen = 0;
                            utf8_lower_boundary = 0;
                            if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                                code_point = cp;
                            }
                            else {
                                code_point = this.decoderError(fatal, _byte);
                            }
                        }
                    }
                }
                //Decode string
                if (code_point !== null && code_point !== this.EOF_code_point) {
                    if (code_point <= 0xFFFF) {
                        if (code_point > 0)
                            result += String.fromCharCode(code_point);
                    }
                    else {
                        code_point -= 0x10000;
                        result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                        result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                    }
                }
            }
            return result;
        };
        /**
         * @private
         *
         * @param code_point
         */
        ByteArray.prototype.encoderError = function (code_point) {
            console.log(1026, code_point);
        };
        /**
         * @private
         *
         * @param fatal
         * @param opt_code_point
         * @returns
         */
        ByteArray.prototype.decoderError = function (fatal, opt_code_point) {
            if (fatal) {
                console.log(1027);
            }
            return opt_code_point || 0xFFFD;
        };
        /**
         * @private
         *
         * @param a
         * @param min
         * @param max
         */
        ByteArray.prototype.inRange = function (a, min, max) {
            return min <= a && a <= max;
        };
        /**
         * @private
         *
         * @param n
         * @param d
         */
        ByteArray.prototype.div = function (n, d) {
            return Math.floor(n / d);
        };
        /**
         * @private
         *
         * @param string
         */
        ByteArray.prototype.stringToCodePoints = function (string) {
            /** @type {Array.<number>} */
            var cps = [];
            // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
            var i = 0, n = string.length;
            while (i < string.length) {
                var c = string.charCodeAt(i);
                if (!this.inRange(c, 0xD800, 0xDFFF)) {
                    cps.push(c);
                }
                else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                    cps.push(0xFFFD);
                }
                else {
                    if (i == n - 1) {
                        cps.push(0xFFFD);
                    }
                    else {
                        var d = string.charCodeAt(i + 1);
                        if (this.inRange(d, 0xDC00, 0xDFFF)) {
                            var a = c & 0x3FF;
                            var b = d & 0x3FF;
                            i += 1;
                            cps.push(0x10000 + (a << 10) + b);
                        }
                        else {
                            cps.push(0xFFFD);
                        }
                    }
                }
                i += 1;
            }
            return cps;
        };
        /** compress需要引用zlib.min.js */
        ByteArray.prototype.compress = function () {
            var deflate = new Zlib.Deflate(new Uint8Array(this.buffer));
            var inbuffer = deflate.compress();
            this.buffer = inbuffer.buffer;
            this._position = 0;
        };
        /** uncompress需要引用zlib.min.js */
        ByteArray.prototype.uncompress = function () {
            var inflate = new Zlib.Inflate(new Uint8Array(this.buffer));
            var inbuffer = inflate.decompress();
            this.buffer = inbuffer.buffer;
            this._position = 0;
        };
        ByteArray.uncompress = function (inputBuffer) {
            var inflate = new Zlib.Inflate(new Uint8Array(inputBuffer));
            var inbuffer = inflate.decompress();
            return inbuffer.buffer;
        };
        return ByteArray;
    }());
    decoder.ByteArray = ByteArray;
    __reflect(ByteArray.prototype, "decoder.ByteArray");
})(decoder || (decoder = {}));
var decoder;
(function (decoder) {
    var ZlibDecoder = (function () {
        function ZlibDecoder() {
        }
        ZlibDecoder.prototype.decode = function (buffer, caller, callback, complete) {
            var contentBytes;
            var bytes = new decoder.ByteArray(buffer);
            function decodeSigle() {
                if (bytes.bytesAvailable) {
                    var name = bytes.readUTF();
                    var needReplace = bytes.readBoolean();
                    var isCompress = bytes.readBoolean();
                    var length = bytes.readUnsignedInt();
                    contentBytes = new decoder.ByteArray();
                    bytes.readBytes(contentBytes, 0, length);
                    if (isCompress) {
                        contentBytes.position = 0;
                        contentBytes = new decoder.ByteArray(decoder.ByteArray.uncompress(contentBytes.buffer));
                    }
                    var content = contentBytes.readUTFBytes(contentBytes.length);
                    if (needReplace)
                        content = content.replace(/\/\//g, '');
                    callback.call(caller, name, content);
                    setTimeout(decodeSigle, 1000 / 60);
                    return;
                }
                complete.call(caller);
            }
            decodeSigle();
        };
        return ZlibDecoder;
    }());
    decoder.ZlibDecoder = ZlibDecoder;
    __reflect(ZlibDecoder.prototype, "decoder.ZlibDecoder");
    decoder.zlibDecoder = new ZlibDecoder();
    var AMFDecoder = (function () {
        function AMFDecoder() {
        }
        AMFDecoder.prototype.decode = function (buffer) {
            var result = {};
            var readArray = new decoder.ByteArray(buffer);
            while (readArray.bytesAvailable) {
                var s = new decoder.ByteArray();
                var name = readArray.readUTF();
                var length = readArray.readInt();
                readArray.readBytes(s, 0, length);
                var d = new amf.Deserializer(new Uint8Array(s.buffer));
                result[name] = d.readObject();
            }
            readArray.clear();
            return result;
        };
        return AMFDecoder;
    }());
    decoder.AMFDecoder = AMFDecoder;
    __reflect(AMFDecoder.prototype, "decoder.AMFDecoder");
    decoder.amfDecoder = new AMFDecoder();
})(decoder || (decoder = {}));
var decoder;
(function (decoder) {
    var CByteArray = (function (_super) {
        __extends(CByteArray, _super);
        function CByteArray(_buffer) {
            var _this = _super.call(this, _buffer) || this;
            _this.Endian = { BIG: 0, LITTLE: 1 };
            _this.ObjectEncoding = { AMF0: 0, AMF3: 3 };
            _this.Amf3Types = {
                kUndefinedType: 0,
                kNullType: 1,
                kFalseType: 2,
                kTrueType: 3,
                kIntegerType: 4,
                kDoubleType: 5,
                kStringType: 6,
                kXMLType: 7,
                kDateType: 8,
                kArrayType: 9,
                kObjectType: 10,
                kAvmPlusXmlType: 11,
                kByteArrayType: 12
            };
            _this.objectTable = [];
            _this.stringTable = [];
            _this.traitTable = [];
            _this.buffer = _buffer;
            return _this;
        }
        CByteArray.prototype.readObject = function () {
            var self = this;
            var obj = self.readAMF3Object();
            self.clean();
            return obj;
        };
        CByteArray.prototype.readAMF3Object = function () {
            var self = this;
            var marker = self.readByte();
            if (marker == self.Amf3Types.kUndefinedType) {
                return undefined;
            }
            else if (marker == self.Amf3Types.kNullType) {
                return null;
            }
            else if (marker == self.Amf3Types.kFalseType) {
                return false;
            }
            else if (marker == self.Amf3Types.kTrueType) {
                return true;
            }
            else if (marker == self.Amf3Types.kIntegerType) {
                var i = self.readUInt29();
                return i;
            }
            else if (marker == self.Amf3Types.kDoubleType) {
                var s = self.readDouble();
                return s;
            }
            else if (marker == self.Amf3Types.kStringType) {
                var sss = self.readStringAMF3();
                return sss;
            }
            else if (marker == self.Amf3Types.kXMLType) {
                // let xml = self.readXML();
                // return xml;
            }
            else if (marker == self.Amf3Types.kDateType) {
                var ref = self.readUInt29();
                if ((ref & 1) == 0)
                    return self.objectTable[(ref >> 1)];
                var d = self.readDouble();
                var value = new Date(d);
                self.objectTable.push(value);
                return value;
            }
            else if (marker == self.Amf3Types.kArrayType) {
                var ref = self.readUInt29();
                if ((ref & 1) == 0)
                    return self.objectTable[(ref >> 1)];
                var len = (ref >> 1);
                var key = self.readStringAMF3();
                if (key == "") {
                    var a = [];
                    for (var i_1 = 0; i_1 < len; i_1++) {
                        var value = self.readAMF3Object();
                        a.push(value);
                    }
                    return a;
                }
                var result = {};
                while (key != "") {
                    result[key] = self.readAMF3Object();
                    key = self.readStringAMF3();
                }
                for (var i_2 = 0; i_2 < len; i_2++) {
                    result[i_2] = self.readAMF3Object();
                }
                return result;
            }
            else if (marker == self.Amf3Types.kObjectType) {
                var o = {};
                self.objectTable.push(o);
                var ref = self.readUInt29();
                if ((ref & 1) == 0)
                    return self.objectTable[(ref >> 1)];
                var ti = self.readTraits(ref);
                var className = ti["className"];
                var externalizable = ti["externalizable"];
                if (externalizable) {
                    o = self.readAMF3Object();
                }
                else {
                    var len = ti["properties"].length;
                    for (var i_3 = 0; i_3 < len; i_3++) {
                        var propName = ti["properties"][i_3];
                        var value1 = self.readAMF3Object();
                        o[propName] = value1;
                    }
                    if (ti["dynamic"]) {
                        for (;;) {
                            var name_1 = self.readStringAMF3();
                            if (name_1 == null || name_1.length == 0)
                                break;
                            var value2 = self.readAMF3Object();
                            o[name_1] = value2;
                        }
                    }
                }
                return o;
            }
            else if (marker == self.Amf3Types.kByteArrayType) {
                var ref = self.readUInt29();
                if ((ref & 1) == 0)
                    return self.objectTable[(ref >> 1)];
                var len = (ref >> 1);
                var ba = new egret.ByteArray();
                self.objectTable.push(ba);
                for (var i_4 = 0; i_4 < len; i_4++) {
                    ba.writeByte(self.readByte());
                }
                return ba;
            }
        };
        CByteArray.prototype.clean = function () {
            var self = this;
            self.objectTable.length = 0;
            self.stringTable.length = 0;
            self.traitTable.length = 0;
        };
        CByteArray.prototype.readUInt29 = function () {
            var self = this;
            var value;
            var b = self.readByte() & 0xFF;
            if (b < 128)
                return b;
            value = (b & 0x7F) << 7;
            b = self.readByte() & 0xFF;
            if (b < 128)
                return (value | b);
            value = (value | (b & 0x7F)) << 7;
            b = self.readByte() & 0xFF;
            if (b < 128)
                return (value | b);
            value = (value | (b & 0x7F)) << 8;
            b = self.readByte() & 0xFF;
            return (value | b);
        };
        CByteArray.prototype.readStringAMF3 = function () {
            var self = this;
            var ref = self.readUInt29();
            if ((ref & 1) == 0)
                return self.stringTable[(ref >> 1)];
            var len = (ref >> 1);
            if (0 == len)
                return "";
            var str = self.readString(len);
            self.stringTable.push(str);
            return str;
        };
        CByteArray.prototype.readString = function (len) {
            var self = this;
            var str = self.readUTFBytes(len);
            return str;
        };
        CByteArray.prototype.readTraits = function (ref) {
            var self = this;
            var traitInfo = {};
            traitInfo["properties"] = [];
            if ((ref & 3) == 1)
                return self.traitTable[(ref >> 2)];
            traitInfo["externalizable"] = ((ref & 4) == 4);
            traitInfo["dynamic"] = ((ref & 8) == 8);
            var a = 0;
            traitInfo["count"] = (ref >> 4);
            traitInfo["className"] = self.readStringAMF3();
            self.traitTable.push(traitInfo);
            for (var i = 0; i < traitInfo["count"]; i++) {
                var propName = self.readStringAMF3();
                traitInfo["properties"].push(propName);
            }
            return traitInfo;
        };
        CByteArray.prototype.readLongUTF = function () {
            var self = this;
            return self.readString(self.readUInt30());
        };
        CByteArray.prototype.readUInt30 = function () {
            var self = this;
            var ch1 = self.readByte();
            var ch2 = self.readByte();
            var ch3 = self.readByte();
            var ch4 = self.readByte();
            if (ch1 >= 64)
                return undefined;
            return ch4 | (ch3 << 8) | (ch2 << 16) | (ch1 << 24);
        };
        return CByteArray;
    }(egret.ByteArray));
    decoder.CByteArray = CByteArray;
    __reflect(CByteArray.prototype, "decoder.CByteArray");
})(decoder || (decoder = {}));
