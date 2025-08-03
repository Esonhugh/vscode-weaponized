// export EdgeInfoComponents  to window

// dump in frontend console: 
console.clear()
let technique_json = []
for (const technique of Object.keys(EdgeInfoComponents)) {
    let tech = EdgeInfoComponents[technique];
    // console.info(tech)
    let win = {};
    try {
        win = tech["windowsAbuse"]();
        // console.log("winabuse props",win)
    } catch (e) {
        // console.debug(`${technique} has no windows abuse`);
        if(tech["windowsAbuse"]) {
            console.debug(`${technique} has paramed windows abuse`)
        }
    }
    let linux = {};
    try {
        linux = tech["linuxAbuse"]();
    } catch(e) {
        if(tech["linuxAbuse"]) {
            console.debug(`${technique} has paramed linux abuse`)
        }
        // console.debug(`${technique} has no linux abuse`);
    }
    let abuse = {};
    try {
        abuse = tech["abuse"]();
    } catch(e) {
        if(tech["abuse"]) {
            console.debug(`${technique} has paramed abuse`)
        }
        // console.debug(`${technique} has no abuse`);
    }
    let gen = {};
    try {
        gen = tech["general"]({
            "sourceType": "$CONTROLLED_OBJECT_TYPE",
            "sourceName": "$CONTROLLED",
            "targetName": "$TARGET",
            "targetType": "$TARGET_OBJECT_TYPE"
        });
        // console.log(gen);
    } catch(e) {
        // console.debug(`${technique} no general`);
    }
    technique_json.push({
        "technique": technique,
        "windows": win,
        "linux": linux,
        "abuse": abuse,
    });
}
console.log(JSON.stringify(technique_json));