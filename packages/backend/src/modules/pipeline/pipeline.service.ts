import { db } from '../../db';
import type {
  CreatePipelineInput,
  UpdatePipelineInput,
  CreateStageInput,
  UpdateStageInput,
} from './pipeline.schema';

// ── Pipelines ─────────────────────────────────────────────────────────────────

export async function listPipelines(tenantId: string) {
  return db('pipelines').where({ tenant_id: tenantId }).orderBy('created_at', 'asc');
}

export async function getPipeline(tenantId: string, id: string) {
  const pipeline = await db('pipelines').where({ id, tenant_id: tenantId }).first();
  if (!pipeline) throw Object.assign(new Error('Pipeline not found'), { status: 404 });

  const stages = await db('pipeline_stages')
    .where({ pipeline_id: id, tenant_id: tenantId })
    .orderBy('position', 'asc');

  return { ...pipeline, stages };
}

export async function createPipeline(tenantId: string, input: CreatePipelineInput) {
  if (input.isDefault) {
    await db('pipelines').where({ tenant_id: tenantId }).update({ is_default: false });
  }

  const [pipeline] = await db('pipelines')
    .insert({ tenant_id: tenantId, name: input.name, is_default: input.isDefault ?? false })
    .returning('*');

  return pipeline;
}

export async function updatePipeline(tenantId: string, id: string, input: UpdatePipelineInput) {
  if (input.isDefault) {
    await db('pipelines').where({ tenant_id: tenantId }).update({ is_default: false });
  }

  const updates: Record<string, unknown> = { updated_at: new Date() };
  if (input.name !== undefined) updates.name = input.name;
  if (input.isDefault !== undefined) updates.is_default = input.isDefault;

  const [pipeline] = await db('pipelines')
    .where({ id, tenant_id: tenantId })
    .update(updates)
    .returning('*');

  if (!pipeline) throw Object.assign(new Error('Pipeline not found'), { status: 404 });
  return pipeline;
}

export async function deletePipeline(tenantId: string, id: string) {
  const deleted = await db('pipelines').where({ id, tenant_id: tenantId }).delete();
  if (!deleted) throw Object.assign(new Error('Pipeline not found'), { status: 404 });
}

// ── Stages ────────────────────────────────────────────────────────────────────

export async function listStages(tenantId: string, pipelineId: string) {
  return db('pipeline_stages')
    .where({ pipeline_id: pipelineId, tenant_id: tenantId })
    .orderBy('position', 'asc');
}

export async function createStage(tenantId: string, pipelineId: string, input: CreateStageInput) {
  const [{ maxPos }] = await db('pipeline_stages')
    .where({ pipeline_id: pipelineId, tenant_id: tenantId })
    .max('position as maxPos');

  const position = input.position ?? (Number(maxPos ?? -1) + 1);

  const [stage] = await db('pipeline_stages')
    .insert({
      tenant_id: tenantId,
      pipeline_id: pipelineId,
      name: input.name,
      color: input.color ?? '#72d296',
      probability: input.probability ?? 0,
      position,
    })
    .returning('*');

  return stage;
}

export async function updateStage(
  tenantId: string,
  pipelineId: string,
  stageId: string,
  input: UpdateStageInput,
) {
  const updates: Record<string, unknown> = { updated_at: new Date() };
  if (input.name !== undefined) updates.name = input.name;
  if (input.color !== undefined) updates.color = input.color;
  if (input.probability !== undefined) updates.probability = input.probability;
  if (input.position !== undefined) updates.position = input.position;

  const [stage] = await db('pipeline_stages')
    .where({ id: stageId, pipeline_id: pipelineId, tenant_id: tenantId })
    .update(updates)
    .returning('*');

  if (!stage) throw Object.assign(new Error('Stage not found'), { status: 404 });
  return stage;
}

export async function deleteStage(tenantId: string, pipelineId: string, stageId: string) {
  const hasDeals = await db('deals').where({ stage_id: stageId, tenant_id: tenantId }).first();
  if (hasDeals) {
    throw Object.assign(
      new Error('Cannot delete a stage that contains deals. Move or delete deals first.'),
      { status: 409 },
    );
  }
  const deleted = await db('pipeline_stages')
    .where({ id: stageId, pipeline_id: pipelineId, tenant_id: tenantId })
    .delete();
  if (!deleted) throw Object.assign(new Error('Stage not found'), { status: 404 });
}

export async function reorderStages(tenantId: string, pipelineId: string, stageIds: string[]) {
  await db.transaction(async (trx) => {
    for (let i = 0; i < stageIds.length; i++) {
      await trx('pipeline_stages')
        .where({ id: stageIds[i], pipeline_id: pipelineId, tenant_id: tenantId })
        .update({ position: i, updated_at: new Date() });
    }
  });
}
