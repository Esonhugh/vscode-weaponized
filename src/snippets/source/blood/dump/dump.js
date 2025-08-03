// export EdgeInfoComponents  to window
// replace all 'const classes = useHelpTextStyles();'
const classes = {
    containsCodeEl: {
        '& code': {
            backgroundColor: "white",
            padding: '2px .5ch',
            fontWeight: 'normal',
            fontSize: '.875em',
            borderRadius: '3px',
            display: 'inline',

            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
        },
    },
};
// export EdgeInfoComponents to window
console.log('EdgeInfoComponents loaded successfully');
(window as any).EdgeInfoComponents = EdgeInfoComponents; // Expose for debugging in browser console


// and open devtools in chrome dump in frontend console:
console.clear();
let technique_json = [];
function attrbuteCheck(technique, tech, name) {
    if(!tech) {
        // console.error("tech undefined");
        return {}
    };
    if(!tech[name]) {
        // console.error(`${technique}[${name}] undefined`);
        return {}
    };
  let func = tech[name];
  let gen = {};
  try {
    if(name == "general") {
        gen = func({
          sourceType: "$SOURCE_TYPE",
          sourceName: "$CONTROLLED",
          targetName: "$TARGET",
          //targetType: "",
        });
    } else {
        gen = func();   
    }
    return gen;
  } catch (e) {
    var func_str = func.toString().split("\n")
    console.debug(`${technique}'s ${name} func has params ${func_str[0]} ${func_str[1]} ${func_str[2]}`);
    console.debug(e);
    return {};
  }
}
for (const technique of Object.keys(EdgeInfoComponents)) {
  let tech = EdgeInfoComponents[technique];
  technique_json.push({
    technique: technique,
    windows: attrbuteCheck(technique, tech, "windowAbuse"),
    linux: attrbuteCheck(technique, tech, "linuxAbuse"),
    abuse: attrbuteCheck(technique, tech, "abuse"),
    general: attrbuteCheck(technique, tech, "general"),
  });
}
console.log(JSON.stringify(technique_json));