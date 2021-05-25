// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
module.exports.getRowsData = async (pageName, id) => {
  if (pageName === 'Books') { return await getBooks(id) }
  if (pageName === 'Authors') { return await getAuthors(id) }
}

module.exports.getRowData = async (pageName, id) => {
  if (pageName === 'Books') { return await getBook(id) }
  if (pageName === 'Authors') { return await getAuthor(id) }
}

module.exports.setRowData = async (path, data) => {

// convert "Books/0/authors/0" --> books[0].authors[0]
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
  
  let dbData =  await getBooks()
  command += " = data"
  eval(command)
  console.log(dbData)
  
//   await save(books)
//   
//   if (pageName === 'Books') { return await setBook(id, data) }
//   if (pageName === 'Authors') { return await setAuthor(id, data) }
}

module.exports.removeRow = async (pageName, id) => {
  if (pageName === 'Books') { return await removeBook(id) }
  if (pageName === 'Authors') { return await removeAuthor(id) }
}

async function getBooks() {
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

async function getBook(id) {
  let books = await getBooks()
  return books[id]
}

async function getAuthors(id) {
  let book = await getBook(id)
  return book.authors
}

async function getAuthor(id) {
  let authors = await getAuthors(id)
  return authors[id]
}

async function setBook(id, data) {
  let books =  await getBooks()
  if (id === null) {
    books.push(data)  
  } else {
    books[id] = data
  }
  
  await save(books)
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

async function removeBook(id) {
  let books =  await getBooks()
  
  books.splice(id, 1)
  
  await save(books)
  
//   let fm = FileManager.iCloud();
//   let fName = "Books.json";
//   let file = fm.joinPath(fm.documentsDirectory(), fName);
//   if (!fm.isFileDownloaded(file)) {
//   	await(fm.downloadFileFromiCloud(file));
//   }
//   books = JSON.stringify(books)
//   fm.writeString(file, books)
  
  return "ok"
}

async function setAuthor(id, data) {
  let books =  await getBooks()
  
  if (id.author === null) {
    books[id.book].authors.push(data)  
  } else {
    books[id.book].authors[id.author] = data
  }
  
  await save(books)
  
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

async function removeAuthor(id) {
  let books =  await getBooks()
  
  books[id.book].authors.splice(id.author, 1)
  
  await save(books)
  
//   let fm = FileManager.iCloud();
//   let fName = "Books.json";
//   let file = fm.joinPath(fm.documentsDirectory(), fName);
//   if (!fm.isFileDownloaded(file)) {
//   	await(fm.downloadFileFromiCloud(file));
//   }
//   books = JSON.stringify(books)
//   fm.writeString(file, books)
  
  return "ok"
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
