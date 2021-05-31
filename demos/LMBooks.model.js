// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
//  let self = module.exports = {}
module.exports.getRowsData = async (path) => {

  const command = "dbData = " + getGetCommand(path)
  
  let dbData   
  eval(command)
  console.log("Eval ok: " + command)
  if (dbData === undefined) { return [] }
  
  return dbData
}

// module.exports.getRowsData1= async (pageName, id) => {
//   if (pageName === 'Books') { return await getBooks(id) }
//   if (pageName === 'Authors') { return await getAuthors(id) }
// }
// 
// module.exports.getRowData = async (pageName, id) => {
//   if (pageName === 'Books') { return await getBook(id) }
//   if (pageName === 'Authors') { return await getAuthor(id) }
// }

module.exports.setRowData = async (path, data) => {

  let command = getSetCommand(path)  
  let dbData =  await getBooks(path)
//   command += " = data"
  console.log("setRowData - command: " + command)
  try { eval(command) } catch(e) {
    let msg = e.message.split(" ", 1)
    if (msg[0] === "undefined") { // push(data) didn't work
		command = command.split(".push")[0] + " = [data]"
		eval(command)
  	 }
}
    
  await save(dbData)
  
  return data
}

module.exports.addNewRow = async (path, data) => {
    
  let dbData = module.exports.getRowsData(path)
  dbData.push(data)
  console.log("added: " + dbData)

//   let i = 0
//   let command = getSetCommand(path)  
//   let dbData =  await getBooks(path)
//   command += " = data"
//   console.log("setRowData - command: " + command)
//   eval(command)
//   console.log("Eval ok: " + command)
//   console.log(dbData)
//   await save(dbData)
  
  return data
}


module.exports.removeRow = async (path, data) => {
  
  let command = getRemoveCommand(path)  
  let dbData =  await getBooks(path)
  eval(command)
  console.log("Eval ok: " + command)
  
  await save(dbData)
  
  return "ok"
}

function getGetCommand(path) {

  let command = "get"
  const parsedPath = path.split("/")
  for (item of parsedPath) {  
    if (isNaN(parseInt(item))) {
      command += item
    }  
  }
  command += "(\"" + path + "\")" 
    
  return command 
}

function getSetCommand(path) {
  // convert "Books/0/authors/0" --> books[0].authors[0] = data
  // convert "Books/2/authors --> books[2].authors.push(data)
  let parsedPath = path.split("/")
  
  let i = 0
  let command
  for (item of parsedPath) {
    if (i === 0) {
      command = "dbData"
      i++
      continue
    }    
    
    if (!isNaN(parseInt(item))) {
      command += "[" + item + "]"
    } else {
      command += "." + item
    }
    i++
  }
  
  if (command.slice(-1) === ".") { return command + "push(data)" }
  
  return command + " = data"
}

function getRemoveCommand(path) {
  // convert "Books/0/authors/0" --> books[0].authors.splice(0, 1)
  let parsedPath = path.split("/")
  
  let i = 0
  let command
  for (item of parsedPath) {
    if (i === 0) {
      command = "dbData"
      i++
      continue
    }    
    
    if (!isNaN(parseInt(item))) {
      if (i === parsedPath.length - 1) {
        command += ".splice(" + item + ", 1)"
      } else {
        command += "[" + item + "]"
      }
    } else {
      command += "." + item
    }
    i++
  }
  
  return command
}

// async function getBooks() {
//   console.log("getBooks")
//   let fm = FileManager.iCloud();
//   let fName = "Books.json";
//   let file = fm.joinPath(fm.documentsDirectory(), fName);
//   if (!fm.isFileDownloaded(file)) {
//   	await(fm.downloadFileFromiCloud(file));
//   }
//   let books = fm.readString(file);
//   books = JSON.parse(books); 
//   return books
// }
function getBooks(path) {
//   console.log("getBooks")
  let fm = FileManager.iCloud();
  let fName = "Books.json";
  let file = fm.joinPath(fm.documentsDirectory(), fName);
  if (!fm.isFileDownloaded(file)) {
  	await(fm.downloadFileFromiCloud(file));
  }
  let books = fm.readString(file);
  books = JSON.parse(books); 
  return books
}

function getBook(id) {
  let books = getBooks()
  return books[id]
}

function getBooksAuthors(path) {
  // expected path: Books/0/Authors
  let parsedPath = path.split("/")
  let book = getBook(parsedPath[1])
//   if (book.Authors === undefined) { return [] }
  return book.Authors
}

function getAuthor(id) {
  let authors = getAuthors(id)
  return Authors[id]
}

function setBook(id, data) {
  let books =  getBooks()
  if (id === null) {
    books.push(data)  
  } else {
    books[id] = data
  }
  
  save(books)
//   let fm = FileManager.iCloud();
//   let fName = "Books.json";
//   let file = fm.joinPath(fm.documentsDirectory(), fName);
//   if (!fm.isFileDownloaded(file)) {
//   	await(fm.downloadFileFromiCloud(file));
//   }
//   books = JSON.stringify(books)
//   fm.writeString(file, books)
  
  return data 
}

// function removeBook(path) {
//   let books =  await getBooks()
//   
//   books.splice(id, 1)
//   
//   await save(books)
//   
//   let fm = FileManager.iCloud();
//   let fName = "Books.json";
//   let file = fm.joinPath(fm.documentsDirectory(), fName);
//   if (!fm.isFileDownloaded(file)) {
//   	await(fm.downloadFileFromiCloud(file));
//   }
//   books = JSON.stringify(books)
//   fm.writeString(file, books)
//   
//   return "ok"
// }

function setAuthor(id, data) {
  let books =  getBooks()
  
  if (id.author === null) {
    books[id.book].authors.push(data)  
  } else {
    books[id.book].authors[id.author] = data
  }
  
  save(books)
  
//   let fm = FileManager.iCloud();
//   let fName = "Books.json";
//   let file = fm.joinPath(fm.documentsDirectory(), fName);
//   if (!fm.isFileDownloaded(file)) {
//   	await(fm.downloadFileFromiCloud(file));
//   }
//   books = JSON.stringify(books)
//   fm.writeString(file, books)
  
  return data 
}

async function save(data) {
  let fm = FileManager.iCloud();
  let fName = "Books.json";
  let file = fm.joinPath(fm.documentsDirectory(), fName);
  if (!fm.isFileDownloaded(file)) {
  	await(fm.downloadFileFromiCloud(file));
  }
  data = JSON.stringify(data)
  fm.writeString(file, data)
  
  return data
}


// *** Test
// let data = {"name":"Martin Fowler a"}
// let result = await self.setRowData("Books/0/Authors/0", data)

