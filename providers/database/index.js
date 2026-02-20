const { Sequelize, DataTypes } = require('sequelize');

class SequelizeAdapter {
    constructor(credentials) {
        this.credentials = credentials;
        this.sequelize = null;
        this.models = {};
        this.listHistory = [];
        this.init().then();
    }

    async init() {
        try {
            const { host, user, database, password, port } = this.credentials;

            this.sequelize = new Sequelize(database, user, password, {
                host: host,
                port: port,
                dialect: 'postgres',
                logging: false, // Set to console.log to see SQL queries
            });

            await this.sequelize.authenticate();
            console.log('🆗 Conexión Correcta DB (Sequelize)');

            this.defineModels();
            await this.sequelize.sync(); // Sync models with DB
            console.log('🆗 Modelos sincronizados');

            return true;
        } catch (error) {
            console.error('🚫 Error de conexión:', error);
            return false;
        }
    }

    defineModels() {
        // Define Contact Model
        this.models.Contact = this.sequelize.define('Contact', {
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            values: {
                type: DataTypes.JSONB,
                defaultValue: {}
            },
            last_interaction: {
                type: DataTypes.DATE,
            }
        }, {
            tableName: 'contact',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_in'
        });

        // Define History Model
        this.models.History = this.sequelize.define('History', {
            ref: {
                type: DataTypes.STRING,
                allowNull: false
            },
            keyword: {
                type: DataTypes.STRING
            },
            answer: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            refSerialize: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false
            },
            options: {
                type: DataTypes.JSONB,
                defaultValue: {}
            }
        }, {
            tableName: 'history',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_in'
        });

        // Define Associations
        this.models.Contact.hasMany(this.models.History, { foreignKey: 'contact_id' });
        this.models.History.belongsTo(this.models.Contact, { foreignKey: 'contact_id' });
    }

    async getPrevByNumber(from) {
        try {
            const result = await this.models.History.findOne({
                where: { phone: from },
                order: [['created_at', 'DESC']],
                limit: 1,
                raw: true
            });

            if (result) {
                // The bot core might expect 'refSerialize' property specifically
                // Ensure compatibility
            }

            return result;
        } catch (error) {
            console.error('Error al obtener la entrada anterior por número:', error);
            return null;
        }
    }

    async save(ctx) {
        try {
            // Ensure contact exists or update it
            const [contact, created] = await this.models.Contact.findOrCreate({
                where: { phone: ctx.from },
                defaults: { phone: ctx.from }
            });

            if (!created) {
                // Update last interaction
                await contact.update({ last_interaction: new Date() });
            }

            // Save history
            await this.models.History.create({
                ref: ctx.ref,
                keyword: ctx.keyword,
                answer: ctx.answer,
                refSerialize: ctx.refSerialize,
                phone: ctx.from,
                options: ctx.options,
                contact_id: contact.id
            });

            this.listHistory.push(ctx);
            console.log('🆗 Historico creado con exito');
        } catch (error) {
            console.error('Error al registrar la entrada del historial:', error);
        }
    }

    async getContact(ctx) {
        try {
            const contact = await this.models.Contact.findOne({
                where: { phone: ctx.from },
                raw: true
            });
            return contact;
        } catch (error) {
            console.error('Error al obtener contacto:', error);
            return null;
        }
    }

    async saveContact(ctx) {
        try {
            // action: u (Actualiza el valor de ctx.values), a (Agrega). Agrega por defecto.
            const action = ctx.action || 'a';
            let newValues = ctx.values || {};

            // First check if contact exists
            const contact = await this.models.Contact.findOne({ where: { phone: ctx.from } });

            if (contact) {
                let currentValues = contact.values || {};

                if (action === 'a') {
                    newValues = { ...currentValues, ...newValues };
                }

                await contact.update({ values: newValues });
            } else {
                await this.models.Contact.create({
                    phone: ctx.from,
                    values: newValues
                });
            }

            console.log('🆗 Contacto guardado o actualizado con éxito');
        } catch (error) {
            console.error('🚫 Error al guardar o actualizar contacto:', error);
        }
    }
}

module.exports = SequelizeAdapter;
