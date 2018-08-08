module.exports.sanitizeInput = (str) => {
    return String(str).replace(/&(?!amp;|lt;|gt;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

module.exports.createResponseData = (id, name, value, attachments) => {

    const responseData = {
        id: id,
        name: module.exports.sanitizeInput(name),
        value: module.exports.sanitizeInput(value),
        attachments: []
    };


    attachments.forEach((item) => {
        const attachmentData = {
            content_type: item.type,
            key: item.key,
            url: '/api/favorites/attach?id=' + id + '&key=' + item.key
        };
        responseData.attachments.push(attachmentData);

    });
    return responseData;
};
