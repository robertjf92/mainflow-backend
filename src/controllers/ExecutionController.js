const FlowInstance = require('../Services/FlowInstance');
const db = require('../models');


module.exports = {
    async index(req, resp){
        const url = req.url;
        const {status, sortType} = req.params;

        try {
            let query = db.Instance.find()
                .sort({starttime: sortType === "asc"? 1: -1});

            if (url.indexOf('execs/summary') >= 0) {
                query.select(["flowId", "status", "phase", "size", "operator", "starttime", "endtime"])
                    .populate("operator", "name")
                    .populate("flowId", "name");
            }
            if (status) query.where({status});

            const instanceList = await query.exec();
            return resp.json(instanceList);
        } catch (error) {
            console.log(error)
            resp.sendStatus(500);
        }
    },

    async create(req, resp){
        const userId = req.get('user-id');
        const {flowId} = req.params;
        const {host, port, user, pass} = req.body;

        const latentFlow = new FlowInstance(flowId, userId);
        

        const connectionRet = await latentFlow.connect(user, pass, host, port);
        
        if (!connectionRet) return resp.status(403).json({ret: -1, message:"Could not connect. Check user, pass and ip address."})
        
        
        await latentFlow.build();
        const startRet = await latentFlow.start();
  
        
        return resp.json(latentFlow.instance);
    },

    remove(req, resp){
        const {flowId} = req.params;
        app.locals.flowInstances[flowId] = false;

        resp.json({ret:0, message:"stop command sent"});
    }

   
}