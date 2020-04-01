/**
 * @api {post} /otp/verify Verify user's OTP
 * @apiVersion 0.1.0
 * @apiGroup OTP
 * @apiParam {String} contactNumber     User's contact number
 * @apiParam {String} otp               Keyed in OTP
 *
 * @apiSuccess {Object} token     User's session token which has their `contactNumber` in the payload (JWT)
 * @apiSuccessExample {json} Success-Reponse:
 *  HTTP/1.1 200 OK
 *    {
 *      "token" : "eyJhbdQssw5c...sadjaksd123j1lkj98c87a4ag20b8621nour978"
 *    }
 */