const Jimp = require('jimp');
const path = require('path');
const userService = require('../services/user-services');
const UserDto = require('../dtos/userDtos');

class ActivateController {
    async activate(req, res){
      console.log("called");
        const {fullname, avatar, phone} = req.body;
        if (!fullname, !avatar, !phone){
            res.status(400).json({message: 'all felds are required'});
        }
        // Image Base64
        const buffer = Buffer.from(
            avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''),
            'base64'
        );
        const imagePath = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}.png`;
        // 32478362874-3242342342343432.png

        try {
            const jimResp = await Jimp.read(buffer);
            jimResp
                .resize(150, Jimp.AUTO)
                .write(path.resolve(__dirname, `../storage/${imagePath}`));
        } catch (err) {
            res.status(500).json({ message: 'Could not process the image' });
        }

        const userId = req.user._id;
        // Update user
        try {
            const user = await userService.findUser({ _id: userId });
            if (!user) {
                res.status(404).json({ message: 'User not found!' });
            }
            user.activated = true;
            user.name = fullname;
            user.avatar = `/storage/${imagePath}`;
            user.phone = phone;
            user.save();
            res.json({ user: new UserDto(user), auth: true });
        } catch (err) {
            res.status(500).json({ message: 'Something went wrong!' });
        }
    }
}
module.exports = new ActivateController();