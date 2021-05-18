// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
module.exports.getRowsData = async (id, model) => {
  
  if (model === 'Books') { return await getBooks(id) }
  if (model === 'Authors') { return await getAuthors(id) }

}

async function getBooks(id) {
  console.log("::Books")
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

async function getAuthors(id) {
  console.log("::Authors")
  const fm = FileManager.iCloud();
  const fName = "Books.json";
  const file = fm.joinPath(fm.documentsDirectory(), fName);
  if (!fm.isFileDownloaded(file)) {
  	await(fm.downloadFileFromiCloud(file));
  }
  let books = fm.readString(file);
  books = JSON.parse(books); 
  let authors = []
  let author = {}
  
  for(let i = 0; i <= 1000; i++) {  
  books[id].authors.forEach((item) => { 
    author = { "Name": item}
    authors.push(author)
  })
}
  
  return authors
}

