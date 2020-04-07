module.exports = {
  up: async (queryInterface, Sequelize) => {
    const currentDatetime = new Date()
    let quarantineEnd = new Date()
    quarantineEnd.setDate(quarantineEnd.getDate() + 90)

    await queryInterface.bulkInsert('QuarantineOrders', [
      {
        id: 'qo_a5c5361c-f996-4a2d-b159-9e810d5f30e7',
        contact_number: '6591720530',
        start_date: currentDatetime,
        end_date: quarantineEnd,
        photo_s3_key: null,
        createdAt: currentDatetime,
        updatedAt: currentDatetime
      },
      {
        id: 'qo_27b8b12b-1a87-402a-a8bf-b3a2e0058e64',
        contact_number: '6591892037',
        start_date: currentDatetime,
        end_date: quarantineEnd,
        photo_s3_key: null,
        createdAt: currentDatetime,
        updatedAt: currentDatetime
      },
      {
        id: 'qo_3ab76179-9c4e-4e99-88de-dee27dd863c1',
        contact_number: '6588298797',
        start_date: currentDatetime,
        end_date: quarantineEnd,
        photo_s3_key: null,
        createdAt: currentDatetime,
        updatedAt: currentDatetime
      },
      {
        id: 'qo_e15077ea-e7e3-49d9-ab2b-b9ad0c9aa719',
        contact_number: '6594559202',
        start_date: currentDatetime,
        end_date: quarantineEnd,
        photo_s3_key: null,
        createdAt: currentDatetime,
        updatedAt: currentDatetime
      },
      {
        id: 'qo_753769f4-0e10-4bae-9f4d-57617409a695',
        contact_number: '6581884602',
        start_date: currentDatetime,
        end_date: quarantineEnd,
        photo_s3_key: null,
        createdAt: currentDatetime,
        updatedAt: currentDatetime
      },
    ]);

    // const orders = await queryInterface.sequelize.query(
    //   `SELECT id FROM QuarantineOrders;`
    // )
    // const orderRows = orders[0]

    let second_report = new Date()
    second_report.setDate(second_report.getDate() + 1)
    let third_report = new Date()
    third_report.setDate(third_report.getDate() + 2)  

    await queryInterface.bulkInsert('LocationReports', [
      {
        id: 1,
        latitude: parseFloat("1.3236"),
        longitude: parseFloat("103.9273"),
        metadata: null,
        order_id: "qo_a5c5361c-f996-4a2d-b159-9e810d5f30e7",
        createdAt: currentDatetime,
        updatedAt: currentDatetime
      },
      {
        id: 2,
        latitude: parseFloat("1.3329"),
        longitude: parseFloat("103.7436"),
        metadata: null,
        order_id: "qo_a5c5361c-f996-4a2d-b159-9e810d5f30e7",
        createdAt: second_report,
        updatedAt: second_report
      },
      {
        id: 3,
        latitude: parseFloat("1.3404"),
        longitude: parseFloat("103.7090"),
        metadata: null,
        order_id: "qo_a5c5361c-f996-4a2d-b159-9e810d5f30e7",
        createdAt: third_report,
        updatedAt: third_report
      },
      {
        id: 4,
        latitude: parseFloat("1.3294"),
        longitude: parseFloat("103.8021"),
        metadata: null,
        order_id: "qo_27b8b12b-1a87-402a-a8bf-b3a2e0058e64",
        createdAt: currentDatetime,
        updatedAt: currentDatetime
      },
      {
        id: 5,
        latitude: parseFloat("1.3312"),
        longitude: parseFloat("103.7972"),
        metadata: null,
        order_id: "qo_27b8b12b-1a87-402a-a8bf-b3a2e0058e64",
        createdAt: second_report,
        updatedAt: second_report
      },
    ]);

    return await queryInterface.bulkInsert('HealthReports', [
      {
        id: 1,
        temperature: parseFloat("36.9"),
        cough: false,
        sore_throat: false,
        runny_nose: false,
        shortness_of_breath: false,
        photo_s3_key: null,
        metadata: null,
        order_id: "qo_a5c5361c-f996-4a2d-b159-9e810d5f30e7",
        createdAt: currentDatetime,
        updatedAt: currentDatetime
      },
      {
        id: 2,
        temperature: parseFloat("37.2"),
        cough: false,
        sore_throat: false,
        runny_nose: false,
        shortness_of_breath: false,
        photo_s3_key: null,
        metadata: null,
        order_id: "qo_a5c5361c-f996-4a2d-b159-9e810d5f30e7",
        createdAt: second_report,
        updatedAt: second_report
      },
      {
        id: 3,
        temperature: parseFloat("37.5"),
        cough: true,
        sore_throat: false,
        runny_nose: false,
        shortness_of_breath: false,
        photo_s3_key: null,
        metadata: null,
        order_id: "qo_a5c5361c-f996-4a2d-b159-9e810d5f30e7",
        createdAt: third_report,
        updatedAt: third_report
      },
      {
        id: 4,
        temperature: parseFloat("36.9"),
        cough: false,
        sore_throat: false,
        runny_nose: false,
        shortness_of_breath: false,
        photo_s3_key: null,
        metadata: null,
        order_id: "qo_27b8b12b-1a87-402a-a8bf-b3a2e0058e64",
        createdAt: currentDatetime,
        updatedAt: currentDatetime
      },
      {
        id: 5,
        temperature: parseFloat("36.6"),
        cough: false,
        sore_throat: false,
        runny_nose: false,
        shortness_of_breath: false,
        photo_s3_key: null,
        metadata: null,
        order_id: "qo_27b8b12b-1a87-402a-a8bf-b3a2e0058e64",
        createdAt: second_report,
        updatedAt: second_report
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('HealthReports', null, {});
    await queryInterface.bulkDelete('LocationReports', null, {});
    await queryInterface.bulkDelete('QuarantineOrders', null, {});
  }
};
