class IndexController {
    constructor(model) {
        this.model = model;
    }

    async getItems(req, res) {
        try {
            const items = await this.model.getAll();
            res.status(200).json(items);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving items', error });
        }
    }

    async createItem(req, res) {
        try {
            const newItem = await this.model.create(req.body);
            res.status(201).json(newItem);
        } catch (error) {
            res.status(500).json({ message: 'Error creating item', error });
        }
    }
}

export default IndexController;