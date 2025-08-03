// export EdgeInfoComponents  to window

// dump in frontend console: 
let technique_json = [];
for (const technique of Object.keys(EdgeInfoComponents)) {
  let tech = EdgeInfoComponents[technique];
  console.info(tech);
  let win = {};
  try {
    win = tech["windowsAbuse"]();
  } catch (e) {
    console.debug(`${technique} has no windows abuse`);
  }
  let linux = {};
  try {
    linux = tech["linuxAbuse"]();
  } catch (e) {
    console.debug(`${technique} has no linux abuse`);
  }
  let abuse = {};
  try {
    abuse = tech["abuse"]();
  } catch (e) {
    console.debug(`${technique} has no abuse`);
  }
  technique_json.push({
    technique: technique,
    windows: win,
    linux: linux,
    abuse: abuse,
  });
}
console.log(JSON.stringify(technique_json));
