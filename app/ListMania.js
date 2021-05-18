// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: file-alt;
/*
List Mania! app
Customizable list manager.
Version: 0.1
Author: @furlan
Changelog at the end of the file.
*/

let appInfo = getAppInfo("Books")

let table = new UITable()

updateTable(appInfo.app.rootPage).then(() => {table.reload()}) 

await table.present(true)

Script.complete()

async function updateTable(path) {
  const entityName = parsePath(path, "entityName")
  const id = parsePath(path, "id")
  const entity = importModule(appInfo.app.model)  
  
  const rowsData = await entity.getRowsData(id, entityName)
  
  // headers
  if (hasHeader(entityName) === true) {
    let row = new UITableRow()
    for (let cell of appInfo.pages[entityName].cells) {
      row.addText(cell.headerTitle, cell.headerSubtitle)
      row.isHeader = true
    }
    table.addRow(row)
  }
  
  // contents
  for (let rowData of rowsData) {
    row = new UITableRow()
    row.dismissOnSelect = false

    for (let cell of appInfo.pages[entityName].cells) {
      if (cell.editable === true) {
        let oCell = row.addButton(rowData[cell.rowTitle].toString())
        oCell.onTap = async () => {
          table.removeAllRows() 
          entity.onTap(cell.rowTitle)
            .then(() => updateTable(entityName))
            .then(() => table.reload())
        } 
       } else {
       // to-do: subtitle 
       row.addText(rowData[cell.rowTitle].toString())
      }
    }
    
    row.onSelect = async (number) => {
      if (hasHeader(entityName) === true) { 
        number--  // because the header
      }
      
      if (appInfo.pages[entityName].onSelect !== undefined) {
        table.removeAllRows()    
        updateTable(number + appInfo.pages[entityName].onSelect)
          .then(() => {
            table.reload()
           })
      }    
    }
    row.cellSpacing = 10
    table.addRow(row)
  }
  
  if (appInfo.pages[entityName].onBack !== undefined) {
    let row = new UITableRow()
    let oCell = row.addButton("⏪ Back")
    oCell.onTap = async () => {
      await table.removeAllRows()
      updateTable(appInfo.pages[entityName].onBack).then(() => table.reload())
    }
    await table.addRow(row)
  }
}

function getAppInfo(app) {  
  let fm = FileManager.iCloud();
  let appFName = app + " app.json";
  let file = fm.joinPath(fm.documentsDirectory(), appFName);
  if (!fm.isFileDownloaded(file)) {
  	await(fm.downloadFileFromiCloud(file));
  }
  let appInfo = fm.readString(file);
  appInfo = JSON.parse(appInfo); 
  return appInfo
}

function hasHeader(entityName) {
  return appInfo.pages[entityName].showHeader
}

function parsePath(path, element) {
  const parsedPath = path.split("/")
  
  let entityName
  let id
  if (parsedPath.length === 1 ) {
    entityName = parsedPath[0] 
  } else {
    id = parsedPath[0]
    entityName = parsedPath[1] 
  }
  
  if (element === "id") {return id}
  if (element === "entityName") {return entityName}
}
