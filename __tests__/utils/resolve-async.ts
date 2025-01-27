export default async function resolveAsync(component: any, props: any) {
  const ComponentResolved = await component(props)
  return () => ComponentResolved
}
