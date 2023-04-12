import fs from 'fs';
import { customAlphabet } from "nanoid";

const categories = ["Artist", "News", "Download", "Tutorials", "Videos", "Loop"];
const data = [];
const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 5);
for (const category of categories) {
    const categoryObject = {
        categoryId: nanoid(),
        name: category,
        createdAt: new Date().toISOString(),
        updatedAt: ""
    };
    data.push(categoryObject);
}

const jsonData = JSON.stringify(data, null, 2);

fs.writeFile('./src/data/category.json', jsonData, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Le fichier category.json a été créé avec succès !');
    }
});