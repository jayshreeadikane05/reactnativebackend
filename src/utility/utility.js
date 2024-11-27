const crypto = require("crypto"); // Added in: node v14.17.0

exports.randomNumber =  (length = 4) => {
	var text = "";
	var possible = "123456789";
	for (var i = 0; i < length; i++) {
		var sup = Math.floor(Math.random() * possible.length);
		text += i > 0 && sup == i ? "0" : possible.charAt(sup);
	}
	return Number(text);
};

exports.createUUID = () => {
	return crypto.randomBytes(10).toString("hex");
};

exports.getAggregationPipeline = (userTotalPoints = null) =>{
    const pipeline = [
        {
            $group: {
                _id: "$user",
                totalPoints: { $sum: "$points" }
            }
        },
        {
            $lookup: {
                from: "users", // Assuming the name of your User collection is "users"
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user" // Unwind the user array created by $lookup
        },
        {
            $sort: { totalPoints: -1, "user.createAt": 1 } // Sort by points and user creation date
        }
    ];
    if (userTotalPoints !== null) {
        pipeline.push({
            $match: { totalPoints: { $gt: userTotalPoints } }
        });
    }
    return pipeline;
}
