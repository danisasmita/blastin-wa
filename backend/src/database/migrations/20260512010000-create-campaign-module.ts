import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("CampaignTemplates", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.createTable("Campaigns", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "draft"
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      segmentFilters: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "{}"
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      sendDelayMs: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1500
      },
      sentCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      failedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      pendingCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      whatsappId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Whatsapps", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      templateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "CampaignTemplates", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      createdById: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.createTable("CampaignRecipients", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending"
      },
      personalizedBody: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      lastError: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Campaigns", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      contactId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Contacts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await (queryInterface as any).addConstraint("CampaignRecipients", {
      fields: ["campaignId", "contactId"],
      type: "unique",
      name: "campaign_recipients_campaign_contact_unique"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await (queryInterface as any).removeConstraint(
      "CampaignRecipients",
      "campaign_recipients_campaign_contact_unique"
    );
    await queryInterface.dropTable("CampaignRecipients");
    await queryInterface.dropTable("Campaigns");
    await queryInterface.dropTable("CampaignTemplates");
  }
};
