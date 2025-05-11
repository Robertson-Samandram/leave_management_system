import { getItemsFromModel, createItemInModel } from '../models';

class IndexService {
    async getItems() {
        try {
            const items = await getItemsFromModel();
            return items;
        } catch (error) {
            throw new Error('Error fetching items: ' + error.message);
        }
    }

    async createItem(data) {
        try {
            const newItem = await createItemInModel(data);
            return newItem;
        } catch (error) {
            throw new Error('Error creating item: ' + error.message);
        }
    }
}

export default new IndexService();