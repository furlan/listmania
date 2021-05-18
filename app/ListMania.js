let appInfo = getAppInfo("Reminders")

let alert = new Alert()
alert.addTextField("Alert!")
alert.addAction("Go!")


let table = new UITable()

updateTable(appInfo.app.rootPage).then(() => {table.reload()})  

await table.present(true)

Script.complete()

async function updateTable(path) {
  
  const parsedPath = path.split("/")
  
  let entityName
  let id
  if (parsedPath.length === 1 ) {
    entityName = parsedPath[0] 
  } else {
    id = parsedPath[0]
    entityName = parsedPath[1] 
  }
  let entity = importModule(appInfo.app.model)  
  
  let rowsData = await entity.getRowsData(id, entityName)
  
  // headers
  if (appInfo.pages[entityName].cells.headers.length > 0) {
    let row = new UITableRow()
    for (header of appInfo.pages[entityName].cells.headers) {
      row.addText(header.title, header.subtitle)
      row.isHeader = true
    }
    table.addRow(row)
  }
  
  for (let rowData of rowsData) {
    row = new UITableRow()
    row.dismissOnSelect = false

    for (let cell of appInfo.pages[entityName].cells.contents) {
      // to-do: subtitle
      row.addText(rowData[cell.map].toString())
    }
    
    row.onSelect = async (number) => {
      if (appInfo.pages[entityName].cells.headers.length > 0) {
        number--
      }
      if (appInfo.pages[entityName].onSelect !== undefined) {
        table.removeAllRows()
//         console.log("pre-update")
//         alert.present().then(() => {table.reload()})       
        updateTable(number + appInfo.pages[entityName].onSelect)
          .then(() => {
            table.reload()
//             console.log("fulfill reload")
           })
//         table.reload()
//         console.log("pos-reload")
      }    
    }
    row.cellSpacing = 10
    table.addRow(row)
  }
  
  if (appInfo.pages[entityName].onBack !== undefined) {
    let row = new UITableRow()
    let back = row.addButton("⏪ Back")
    back.onTap = async () => {
      await table.removeAllRows()
      updateTable(appInfo.pages[entityName].onBack).then(() => table.reload())
//       await table.reload()
    }
    await table.addRow(row)
  }
//   table.reload()
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

