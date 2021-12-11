pragma circom 2.0.2;

include "./command_to_bits.circom";
include "./eddsasha2.circom";

template CheckCommandSign() {
    var CommandArgs = 6;
    var ByteBits = 8;
    var CommandBytes = 81;
    var CommandsBits = CommandBytes * ByteBits;

    signal input args[CommandArgs];
    signal input ax;
    signal input ay;
    signal input rx;
    signal input ry;
    signal input s;
    signal output out;

    component c2b = Command2Bits();
    for (var i = 0; i < CommandArgs; i++) {
        c2b.args[i] <== args[i];
    }

    component cs = CheckSign(CommandsBits);
    cs.ax <== ax;
    cs.ay <== ay;
    cs.rx <== rx;
    cs.ry <== ry;
    cs.s <== s;

    for (var i = 0; i < CommandsBits; i++) {
        cs.msg[i] <== c2b.out[i];
    }

    out <== cs.out;
}
