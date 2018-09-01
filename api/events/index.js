const router = require('express').Router();

const newEventSchema = require('../../schema/newEvent');
const updatedEventSchema = require('../../schema/event');

const Validator = require('jsonschema').Validator;
const validator = new Validator();

module.exports = (db) => {
    const Event = require('../../db/event')(db);

    //POST /events
    router.post('/', async (request, response) => {
        const newEvent = request.body;
        try {
            const error = new Error();
            if (!validator.validate(newEvent, newEventSchema).valid) {
                error.message = 'Invalid request';
                error.code = 'ValidationException';
                throw error;
            }
            const result = await Event.create(newEvent);
            response.status(200).json({message: 'Event created'});
        } catch (e) {
            if (e.code === 'ValidationException') {
                response.status(405).json({message: e.message});
            } else {
                response.status(500).json({message: e.message});
            }
        }
    });

    //GET /events
    router.get('/', async (request, response) => {
        try {
            const result = await Event.getAll().toArray();
            response.status(200).json(result);
        } catch (e) {
            response.status(500).json({message: e.message});
        }
    });

    //PUT /events
    router.put('/', async (request, response) => {
        try {
            const error = new Error();
            if (!validator.validate(request.body, updatedEventSchema).valid) {
                error.message = 'Invalid input';
                error.code = 'ValidationException';
                throw error;
            }
            const updatedEvent = request.body;
            const result = await Event.update(updatedEvent);
            const insertedEvent = result.message.documents[0];
            if (result.result.n === 0) {
                error.message = 'The event with the specified ID doesn\'t exist.';
                error.code = 'EventNotFound';
                throw error;
            }
            response.status(200).json({message: 'Event updated'});
        } catch (e) {
            if (e.code === 'ValidationException') {
                response.status(405).json({message: e.message});
            } else if (e.code === 'EventNotFound') {
                response.status(404).json({message: e.message});
            } else {
                response.status(500).json({message: e.message});
            }
        }
    });

    //GET /events/{id}
    router.get('/:id', async (request, response) => {
        try {
            const event = await Event.get(request.params.id);
            if (event !== null) {
                response.status(200).json(event);
            } else {
                response.status(404).json({message: 'Event not found'});
            }
        } catch (e) {
            response.status(500).json({message: e.message});
        }
    });

    return router;
};