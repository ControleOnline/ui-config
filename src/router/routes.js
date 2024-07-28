export const routes = [{
  path: '/config/',
  component: () =>  import ('@controleonline/ui-layout/src/layouts/AdminLayout.vue'),
  children: [
    {
      name: 'MenuIndex',
      path: 'menus',
      component: () =>  import ('../pages/Config/Menu.vue'),
    },    
    {
      name: 'ModuleIndex',
      path: 'modules',
      component: () =>  import ('../pages/Config/Module.vue'),
    }, 
    {
      name: 'RoleIndex',
      path: 'roles',
      component: () =>  import ('../pages/Config/Role.vue'),
    }, 
  ]
}];

export default routes
