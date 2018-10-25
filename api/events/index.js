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
            const event = await Event.getById(request.params.id);
            if (event !== null) {
                response.status(200).json(event);
            } else {
                response.status(404).json({message: 'Event not found'});
            }
        } catch (e) {
            response.status(500).json({message: e.message});
        }
    });

    router.delete('/:id', async (request, response) => {
        try {
            const deleted = await Event.delete_one(request.params.id);
            // console.log(deleted);
            if (deleted.CommandResult.message.Response.parsed === true) {
                response.status(200).json(event);
            } else {
                response.status(404).json({message: 'Event not found'});
            }
        } catch (e) {
            response.status(200).json({message: 'deleted'});
        }
    });


    //POST /events/participant
    router.post('/participant', async (request, response)=>{
        try{
            const event = await Event.getById(request.body.id);
            let parti = event.participants;
            let ans = [];
            for(let i=0; i< parti.length; ++i){
                let temp = {};
                let new_parti = await Event.get_user(parti[i]);
                temp = {
                    id: new_parti.id,
                    name: new_parti.name,
                    phone: new_parti.phone,
                    year: new_parti.year,
                    branch: new_parti.branch
                };
                ans.push(temp);
            }
            // console.log(ans);
            response.status(200).json(ans);
        }catch (e) {
            console.log(e.message);
        }
    });

    return router;
};