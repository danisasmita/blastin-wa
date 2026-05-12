import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import CampaignTemplate from "./CampaignTemplate";
import CampaignRecipient from "./CampaignRecipient";
import Whatsapp from "./Whatsapp";
import User from "./User";

@Table
class Campaign extends Model<Campaign> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Default("draft")
  @Column(DataType.STRING)
  status: string;

  @Column(DataType.TEXT)
  body: string;

  @Default("{}")
  @Column(DataType.TEXT)
  segmentFilters: string;

  @Column(DataType.DATE)
  scheduledAt: Date;

  @Column(DataType.DATE)
  startedAt: Date;

  @Column(DataType.DATE)
  completedAt: Date;

  @Default(1500)
  @Column
  sendDelayMs: number;

  @Default(0)
  @Column
  sentCount: number;

  @Default(0)
  @Column
  failedCount: number;

  @Default(0)
  @Column
  pendingCount: number;

  @ForeignKey(() => Whatsapp)
  @AllowNull(false)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @ForeignKey(() => CampaignTemplate)
  @Column
  templateId: number;

  @BelongsTo(() => CampaignTemplate)
  template: CampaignTemplate;

  @ForeignKey(() => User)
  @Column
  createdById: number;

  @BelongsTo(() => User, "createdById")
  createdBy: User;

  @HasMany(() => CampaignRecipient)
  recipients: CampaignRecipient[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Campaign;
